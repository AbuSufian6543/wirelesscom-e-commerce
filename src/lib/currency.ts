export type Currency = "CAD" | "USD";

export function getProductPrice(
  product: {
    priceCadCents: number;
    priceUsdCents: number;
    saleCadCents?: number | null;
    saleUsdCents?: number | null;
  },
  currency: Currency,
) {
  const priceCents =
    currency === "CAD" ? product.priceCadCents : product.priceUsdCents;
  const saleCents =
    currency === "CAD" ? product.saleCadCents : product.saleUsdCents;

  return {
    priceCents,
    saleCents: saleCents ?? null,
    currentCents: saleCents ?? priceCents,
    onSale: saleCents != null && saleCents < priceCents,
  };
}

export function getVariantPrice(
  variant: {
    priceCadCents?: number | null;
    priceUsdCents?: number | null;
    saleCadCents?: number | null;
    saleUsdCents?: number | null;
  },
  product: {
    priceCadCents: number;
    priceUsdCents: number;
    saleCadCents?: number | null;
    saleUsdCents?: number | null;
  },
  currency: Currency,
) {
  const priceCents =
    currency === "CAD"
      ? (variant.priceCadCents ?? product.priceCadCents)
      : (variant.priceUsdCents ?? product.priceUsdCents);
  const saleCents =
    currency === "CAD"
      ? (variant.saleCadCents ?? product.saleCadCents)
      : (variant.saleUsdCents ?? product.saleUsdCents);

  return {
    priceCents,
    saleCents: saleCents ?? null,
    currentCents: saleCents ?? priceCents,
    onSale: saleCents != null && saleCents < priceCents,
  };
}
