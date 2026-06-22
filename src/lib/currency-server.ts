import { cookies } from "next/headers";
import type { Currency } from "./currency";

export const CURRENCY_COOKIE = "store_currency";

export async function getCurrency(): Promise<Currency> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CURRENCY_COOKIE)?.value;
  return value === "USD" ? "USD" : "CAD";
}

export type { Currency };
