#!/usr/bin/env python3
"""
Extract product images from the Hytera DMR Pricebook PDF.

Usage:
  pip install pymupdf pillow
  python scripts/extract-pricebook-images.py --pdf "path/to/pricebook.pdf"

Reads scripts/pricebook-image-map.json and writes public/products/{slug}.webp
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import deque
from io import BytesIO
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Install PyMuPDF: pip install pymupdf pillow", file=sys.stderr)
    sys.exit(1)

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install pillow", file=sys.stderr)
    sys.exit(1)


ROOT = Path(__file__).resolve().parent.parent
MAP_PATH = Path(__file__).resolve().parent / "pricebook-image-map.json"
OUT_DIR = ROOT / "public" / "products"

# Matches storefront card background (slate-50)
OFF_WHITE = (248, 250, 252)
BG_DARK_MAX = 45
BG_LIGHT_MIN = 245
CANVAS_SIZE = 900
CANVAS_FILL = 0.82


def is_banner(img: dict) -> bool:
    w, h = img["width"], img["height"]
    if h <= 0:
        return True
    ratio = w / h
    return w > 300 and ratio > 2.2


def is_background_pixel(r: int, g: int, b: int, a: int = 255) -> bool:
    if max(r, g, b) <= BG_DARK_MAX:
        return True
    if min(r, g, b) >= BG_LIGHT_MIN:
        return True
    return False


def flood_background_mask(pixels: list[tuple[int, int, int, int]], width: int, height: int) -> bytearray:
    mask = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def try_push(x: int, y: int) -> None:
        index = y * width + x
        if mask[index]:
            return
        r, g, b, a = pixels[index]
        if is_background_pixel(r, g, b, a):
            mask[index] = 1
            queue.append((x, y))

    for x in range(width):
        try_push(x, 0)
        try_push(x, height - 1)
    for y in range(height):
        try_push(0, y)
        try_push(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height:
                try_push(nx, ny)

    return mask


def refine_background_mask(
    mask: bytearray, pixels: list[tuple[int, int, int, int]], width: int, height: int, passes: int = 2
) -> bytearray:
    """Remove dark fringe pixels that sit between product edges and the background."""
    refined = bytearray(mask)
    for _ in range(passes):
        next_mask = bytearray(refined)
        for y in range(height):
            for x in range(width):
                index = y * width + x
                if refined[index]:
                    continue
                r, g, b, _ = pixels[index]
                if max(r, g, b) > 120:
                    continue
                neighbors = 0
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height and refined[ny * width + nx]:
                        neighbors += 1
                if neighbors >= 2:
                    next_mask[index] = 1
        refined = next_mask
    return refined


def fill_enclosed_background_holes(
    mask: bytearray, pixels: list[tuple[int, int, int, int]], width: int, height: int
) -> bytearray:
    """Fill small interior pockets of background color (e.g. inside coiled cables)."""
    filled = bytearray(mask)
    visited = bytearray(width * height)

    for start in range(width * height):
        if filled[start] or visited[start]:
            continue
        r, g, b, _ = pixels[start]
        if not is_background_pixel(r, g, b):
            continue

        queue: deque[int] = deque([start])
        component: list[int] = []
        touches_border = False

        while queue:
            index = queue.popleft()
            if visited[index]:
                continue
            visited[index] = 1
            component.append(index)
            x = index % width
            y = index // width
            if x == 0 or y == 0 or x == width - 1 or y == height - 1:
                touches_border = True
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if not (0 <= nx < width and 0 <= ny < height):
                    continue
                next_index = ny * width + nx
                if filled[next_index] or visited[next_index]:
                    continue
                nr, ng, nb, _ = pixels[next_index]
                if is_background_pixel(nr, ng, nb):
                    queue.append(next_index)

        if not touches_border and len(component) < width * height * 0.08:
            for index in component:
                filled[index] = 1

    return filled


def _downscale_for_processing(img: Image.Image, max_dim: int = 1400) -> Image.Image:
    width, height = img.size
    longest = max(width, height)
    if longest <= max_dim:
        return img
    scale = max_dim / longest
    return img.resize((max(1, int(width * scale)), max(1, int(height * scale))), Image.Resampling.LANCZOS)


def post_process_image(img: Image.Image, canvas_size: int = CANVAS_SIZE) -> Image.Image:
    """Replace PDF black/white backgrounds with off-white and normalize to a square canvas."""
    rgba = _downscale_for_processing(img.convert("RGBA"))
    width, height = rgba.size
    pixels = list(rgba.get_flattened_data())

    mask = flood_background_mask(pixels, width, height)
    mask = refine_background_mask(mask, pixels, width, height)
    mask = fill_enclosed_background_holes(mask, pixels, width, height)

    composited_data: list[tuple[int, int, int, int]] = []
    bbox: list[int] | None = None
    for index, (r, g, b, a) in enumerate(pixels):
        if mask[index]:
            composited_data.append(OFF_WHITE + (255,))
            continue
        composited_data.append((r, g, b, a))
        y, x = divmod(index, width)
        if bbox is None:
            bbox = [x, y, x, y]
        else:
            bbox[0] = min(bbox[0], x)
            bbox[1] = min(bbox[1], y)
            bbox[2] = max(bbox[2], x)
            bbox[3] = max(bbox[3], y)

    composited = Image.new("RGBA", (width, height))
    composited.putdata(composited_data)

    if bbox is None:
        return composited.convert("RGB")

    content_w = bbox[2] - bbox[0]
    content_h = bbox[3] - bbox[1]
    pad = max(10, int(0.02 * max(content_w, content_h)))
    x0 = max(0, bbox[0] - pad)
    y0 = max(0, bbox[1] - pad)
    x1 = min(width - 1, bbox[2] + pad)
    y1 = min(height - 1, bbox[3] + pad)
    cropped = composited.crop((x0, y0, x1 + 1, y1 + 1))

    crop_w, crop_h = cropped.size
    max_side = canvas_size * CANVAS_FILL
    scale = min(max_side / crop_w, max_side / crop_h)
    new_w = max(1, int(crop_w * scale))
    new_h = max(1, int(crop_h * scale))
    resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)

    canvas = Image.new("RGB", (canvas_size, canvas_size), OFF_WHITE)
    offset_x = (canvas_size - new_w) // 2
    offset_y = (canvas_size - new_h) // 2
    canvas.paste(resized, (offset_x, offset_y), resized)
    return canvas


def list_page_images(doc: fitz.Document, page_index: int, min_width: int = 0) -> list[dict]:
    page = doc[page_index]
    seen: set[int] = set()
    images: list[dict] = []

    for info in page.get_image_info(xrefs=True):
        xref = info["xref"]
        if xref in seen:
            continue
        seen.add(xref)
        try:
            extracted = doc.extract_image(xref)
        except Exception:
            continue
        w = extracted.get("width") or info.get("width") or 0
        h = extracted.get("height") or info.get("height") or 0
        if w < min_width:
            continue
        item = {
            "xref": xref,
            "width": w,
            "height": h,
            "area": w * h,
            "bytes": extracted["image"],
            "ext": extracted.get("ext", "png"),
        }
        if is_banner(item):
            continue
        images.append(item)

    images.sort(key=lambda x: x["area"], reverse=True)
    return images


def save_webp(image_bytes: bytes, out_path: Path) -> None:
    img = Image.open(BytesIO(image_bytes))
    processed = post_process_image(img)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    processed.save(out_path, "WEBP", quality=85, method=6)


def save_webp_from_image(img: Image.Image, out_path: Path) -> None:
    processed = post_process_image(img)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    processed.save(out_path, "WEBP", quality=85, method=6)


def render_page_crop(doc: fitz.Document, page_index: int, entry: dict) -> bytes:
    page = doc[page_index]
    rect = page.rect
    crop_rect = entry.get("cropRect")
    if crop_rect and len(crop_rect) == 4:
        left, top, right, bottom = (float(v) for v in crop_rect)
        clip = fitz.Rect(
            rect.x0 + rect.width * left,
            rect.y0 + rect.height * top,
            rect.x0 + rect.width * right,
            rect.y0 + rect.height * bottom,
        )
    else:
        crop_top_ratio = float(entry.get("cropTop", 0.42))
        clip = fitz.Rect(rect.x0, rect.y0, rect.x1, rect.y0 + rect.height * crop_top_ratio)

    dpi = int(entry.get("dpi", 200))
    matrix = fitz.Matrix(dpi / 72, dpi / 72)
    pix = page.get_pixmap(matrix=matrix, clip=clip, alpha=False)
    return pix.tobytes("png")


def pick_image(images: list[dict], entry: dict) -> dict | None:
    if not images:
        return None
    strategy = entry.get("strategy", "largest")
    if strategy == "imageIndex":
        idx = int(entry.get("imageIndex", 0))
        return images[idx] if idx < len(images) else None
    return images[0]


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract Hytera product images from pricebook PDF")
    parser.add_argument("--pdf", help="Path to Hytera DMR Pricebook PDF")
    parser.add_argument("--map", default=str(MAP_PATH), help="Path to pricebook-image-map.json")
    parser.add_argument("--list-page", type=int, help="Debug: list images on a 0-based page index")
    parser.add_argument(
        "--postprocess-only",
        action="store_true",
        help="Re-run off-white background + square normalize on existing public/products/*.webp",
    )
    args = parser.parse_args()

    if args.postprocess_only:
        files = sorted(OUT_DIR.glob("*.webp"))
        if not files:
            print(f"No images found in {OUT_DIR}", file=sys.stderr)
            return 1
        for path in files:
            img = Image.open(path)
            save_webp_from_image(img, path)
            print(f"Processed {path.relative_to(ROOT)} ({img.size[0]}x{img.size[1]} -> {CANVAS_SIZE}x{CANVAS_SIZE})")
        print(f"Post-processed {len(files)} images")
        return 0

    if not args.pdf:
        parser.error("--pdf is required unless using --postprocess-only")

    pdf_path = Path(args.pdf)
    if not pdf_path.is_file():
        print(f"PDF not found: {pdf_path}", file=sys.stderr)
        return 1

    with open(args.map, encoding="utf-8") as f:
        config = json.load(f)

    doc = fitz.open(pdf_path)

    if args.list_page is not None:
        imgs = list_page_images(doc, args.list_page, min_width=0)
        print(f"Page {args.list_page} ({args.list_page + 1} in PDF): {len(imgs)} images")
        for i, img in enumerate(imgs):
            print(f"  [{i}] {img['width']}x{img['height']} area={img['area']} ext={img['ext']}")
        return 0

    print(f"{'Slug':<42} {'Page':>4} {'Size':>12} Output")
    print("-" * 80)

    ok = 0
    failed: list[str] = []

    for entry in config["products"]:
        slug = entry["slug"]
        page = int(entry["page"])
        min_width = int(entry.get("minWidth", 0))
        out_path = OUT_DIR / f"{slug}.webp"

        if page < 0 or page >= doc.page_count:
            failed.append(f"{slug}: page {page} out of range")
            continue

        images = list_page_images(doc, page, min_width=min_width)
        strategy = entry.get("strategy", "largest")

        if strategy == "renderCrop":
            try:
                png_bytes = render_page_crop(doc, page, entry)
                save_webp(png_bytes, out_path)
                print(f"{slug:<42} {page + 1:>4} {'render':>12} {out_path.relative_to(ROOT)}")
                ok += 1
            except Exception as exc:
                failed.append(f"{slug}: render failed — {exc}")
            continue

        chosen = pick_image(images, entry)

        if not chosen:
            failed.append(f"{slug}: no image on page {page} (found {len(images)} above minWidth)")
            continue

        try:
            save_webp(chosen["bytes"], out_path)
            size = f"{chosen['width']}x{chosen['height']}"
            print(f"{slug:<42} {page + 1:>4} {size:>12} {out_path.relative_to(ROOT)}")
            ok += 1
        except Exception as exc:
            failed.append(f"{slug}: save failed — {exc}")

    doc.close()

    print("-" * 80)
    print(f"Extracted {ok}/{len(config['products'])} images to {OUT_DIR.relative_to(ROOT)}/")
    print(f"Post-process: off-white background, trimmed, {CANVAS_SIZE}x{CANVAS_SIZE} canvas")

    if failed:
        print("\nFailures:")
        for msg in failed:
            print(f"  - {msg}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
