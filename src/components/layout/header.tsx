"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, User, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SITE_PHONE } from "@/lib/constants";
import { setCurrencyAction } from "@/app/actions/currency";

export function Header({
  cartCount = 0,
  currency,
}: {
  cartCount?: number;
  currency: "CAD" | "USD";
}) {
  const router = useRouter();

  async function switchCurrency(next: "CAD" | "USD") {
    await setCurrencyAction(next);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="border-b bg-slate-900 text-white">
        <div className="container-page flex items-center justify-between py-2 text-xs sm:text-sm">
          <p>No Monthly Service Fees - No Contracts - Expert Support</p>
          <p className="hidden sm:block">{SITE_PHONE}</p>
        </div>
      </div>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <Radio className="h-7 w-7 text-red-600" />
          <span className="text-lg">{SITE_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/categories/business-radios" className="text-sm font-medium text-slate-700 hover:text-red-600">
            Categories
          </Link>
          <Link href="/industries/security" className="text-sm font-medium text-slate-700 hover:text-red-600">
            Industries
          </Link>
          <Link href="/search" className="text-sm font-medium text-slate-700 hover:text-red-600">
            Search
          </Link>
          <Link href="/about" className="text-sm font-medium text-slate-700 hover:text-red-600">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium text-slate-700 hover:text-red-600">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-md border border-slate-200 p-0.5 sm:flex">
            {(["CAD", "USD"] as const).map((c) => (
              <button
                key={c}
                onClick={() => switchCurrency(c)}
                className={`rounded px-2 py-1 text-xs font-semibold ${
                  currency === c
                    ? "bg-red-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/search" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/account" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
