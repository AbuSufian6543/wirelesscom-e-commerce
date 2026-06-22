import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { getProductPrice, type Currency } from "@/lib/currency";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    brand?: string | null;
    priceCadCents: number;
    priceUsdCents: number;
    saleCadCents?: number | null;
    saleUsdCents?: number | null;
    isNewArrival: boolean;
    isBestSeller: boolean;
    hasVariants: boolean;
  };
  currency: Currency;
};

export function ProductCard({ product, currency }: ProductCardProps) {
  const pricing = getProductPrice(product, currency);
  const image = product.images[0] ?? "/placeholder-product.svg";

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-square bg-slate-50">
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-contain p-4 transition group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product.isNewArrival && <Badge>New</Badge>}
          {product.isBestSeller && (
            <Badge className="bg-amber-100 text-amber-800">Best Seller</Badge>
          )}
          {pricing.onSale && <Badge>Sale</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        {product.brand && (
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {product.brand}
          </p>
        )}
        <h3 className="mt-1 line-clamp-2 font-semibold text-slate-900 group-hover:text-red-600">
          {product.name}
        </h3>
        <div className="mt-auto pt-3">
          {pricing.onSale ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-red-600">
                {formatPrice(pricing.currentCents, currency)}
              </span>
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(pricing.priceCents, currency)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-slate-900">
              {product.hasVariants ? "From " : ""}
              {formatPrice(pricing.currentCents, currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
