export const SITE_NAME = "Rapid Radio Gear";
export const SITE_TAGLINE = "Nationwide Two-Way Radios & Accessories";
export const SITE_PHONE = "1-800-555-RADIO";
export const SITE_EMAIL = "support@rapidradiogear.com";

export const SHIPPING_FLAT_RATE_CAD_CENTS = 1500;
export const SHIPPING_FLAT_RATE_USD_CENTS = 1200;
export const FREE_SHIPPING_THRESHOLD_CAD_CENTS = 12500;
export const FREE_SHIPPING_THRESHOLD_USD_CENTS = 10000;

export function getShippingCents(subtotalCents: number, currency: "CAD" | "USD") {
  const threshold =
    currency === "CAD"
      ? FREE_SHIPPING_THRESHOLD_CAD_CENTS
      : FREE_SHIPPING_THRESHOLD_USD_CENTS;
  const flatRate =
    currency === "CAD"
      ? SHIPPING_FLAT_RATE_CAD_CENTS
      : SHIPPING_FLAT_RATE_USD_CENTS;

  return subtotalCents >= threshold ? 0 : flatRate;
}
