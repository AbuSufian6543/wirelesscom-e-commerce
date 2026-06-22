"use client";

import { useState } from "react";

export function FeaturedTabs({
  newArrivals,
  bestSellers,
}: {
  newArrivals: React.ReactNode;
  bestSellers: React.ReactNode;
}) {
  const [tab, setTab] = useState<"new" | "best">("best");

  return (
    <div>
      <div className="mb-8 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
        <button
          onClick={() => setTab("best")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            tab === "best"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Best Sellers
        </button>
        <button
          onClick={() => setTab("new")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            tab === "new"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          New Arrivals
        </button>
      </div>
      <div className={tab === "best" ? "block" : "hidden"}>{bestSellers}</div>
      <div className={tab === "new" ? "block" : "hidden"}>{newArrivals}</div>
    </div>
  );
}
