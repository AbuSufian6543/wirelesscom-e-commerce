"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { CURRENCY_COOKIE } from "@/lib/currency-server";

export async function setCurrencyAction(currency: "CAD" | "USD") {
  const cookieStore = await cookies();
  cookieStore.set(CURRENCY_COOKIE, currency, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
