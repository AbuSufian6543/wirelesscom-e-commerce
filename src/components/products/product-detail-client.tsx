"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { addToCartAction } from "@/app/actions/cart";
import { formatPrice } from "@/lib/utils";
import {
  getProductPrice,
  getVariantPrice,
  type Currency,
} from "@/lib/currency";

type Variant = {
  id: string;
  sku: string;
  stock: number;
  image?: string | null;
  priceCadCents?: number | null;
  priceUsdCents?: number | null;
  saleCadCents?: number | null;
  saleUsdCents?: number | null;
  options: Array<{
    optionValue: { id: string; value: string; option: { id: string; name: string } };
  }>;
};

type Option = {
  id: string;
  name: string;
  values: Array<{ id: string; value: string }>;
};

type ProductDetailClientProps = {
  product: {
    id: string;
    name: string;
    brand?: string | null;
    description: string;
    shortDescription?: string | null;
    images: string[];
    hasVariants: boolean;
    priceCadCents: number;
    priceUsdCents: number;
    saleCadCents?: number | null;
    saleUsdCents?: number | null;
  };
  options: Option[];
  variants: Variant[];
  currency: Currency;
};

export function ProductDetailClient({
  product,
  options,
  variants,
  currency,
}: ProductDetailClientProps) {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedVariant = useMemo(() => {
    if (!product.hasVariants || !variants.length) return null;
    return (
      variants.find((variant) =>
        variant.options.every(
          (o) => selectedValues[o.optionValue.option.id] === o.optionValue.id,
        ),
      ) ?? null
    );
  }, [product.hasVariants, variants, selectedValues]);

  const pricing = selectedVariant
    ? getVariantPrice(selectedVariant, product, currency)
    : getProductPrice(product, currency);

  const image =
    selectedVariant?.image ?? product.images[0] ?? "/placeholder-product.svg";

  const inStock = selectedVariant ? selectedVariant.stock > 0 : true;
  const canAdd =
    !product.hasVariants || (selectedVariant != null && selectedVariant.stock > 0);

  async function handleAddToCart(formData: FormData) {
    setPending(true);
    setMessage(null);
    await addToCartAction(formData);
    setPending(false);
    setMessage("Added to cart!");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <Image src={image} alt={product.name} fill className="object-contain p-8" />
        {pricing.onSale && (
          <div className="absolute left-4 top-4">
            <Badge>Sale</Badge>
          </div>
        )}
      </div>

      <div>
        {product.brand && (
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {product.brand}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h1>
        {product.shortDescription && (
          <p className="mt-3 text-slate-600">{product.shortDescription}</p>
        )}

        <div className="mt-6 flex items-center gap-3">
          {pricing.onSale ? (
            <>
              <span className="text-3xl font-bold text-red-600">
                {formatPrice(pricing.currentCents, currency)}
              </span>
              <span className="text-xl text-slate-400 line-through">
                {formatPrice(pricing.priceCents, currency)}
              </span>
              <Badge>
                Save {formatPrice(pricing.priceCents - pricing.currentCents, currency)}
              </Badge>
            </>
          ) : (
            <span className="text-3xl font-bold text-slate-900">
              {formatPrice(pricing.currentCents, currency)}
            </span>
          )}
        </div>

        <form action={handleAddToCart} className="mt-8 space-y-6">
          <input type="hidden" name="productId" value={product.id} />
          {selectedVariant && (
            <input type="hidden" name="variantId" value={selectedVariant.id} />
          )}

          {options.map((option) => (
            <div key={option.id}>
              <Label className="mb-2 block">{option.name}</Label>
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const active = selectedValues[option.id] === value.id;
                  return (
                    <button
                      key={value.id}
                      type="button"
                      onClick={() =>
                        setSelectedValues((prev) => ({ ...prev, [option.id]: value.id }))
                      }
                      className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                        active
                          ? "border-red-600 bg-red-50 text-red-700"
                          : "border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {value.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <Label htmlFor="quantity" className="mb-2 block">
              Quantity
            </Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              max={selectedVariant?.stock ?? 99}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-24"
            />
          </div>

          {product.hasVariants && !selectedVariant && (
            <p className="text-sm text-amber-700">Please select all options.</p>
          )}
          {selectedVariant && !inStock && (
            <p className="text-sm text-red-600">Out of stock.</p>
          )}

          <Button type="submit" size="lg" disabled={!canAdd || pending}>
            {pending
              ? "Adding..."
              : canAdd
                ? "Add to Cart"
                : product.hasVariants
                  ? "Select Options"
                  : "Add to Cart"}
          </Button>
          {message && <p className="text-sm text-green-600">{message}</p>}
        </form>

        <div className="prose-store mt-10 whitespace-pre-line border-t border-slate-200 pt-8">
          {product.description}
        </div>
      </div>
    </div>
  );
}
