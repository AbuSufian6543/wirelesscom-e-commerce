"use client";

import { Minus, Plus } from "lucide-react";

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
  id?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  label,
  id = "quantity",
}: QuantitySelectorProps) {
  const height = size === "sm" ? "h-10" : "h-12";
  const buttonWidth = size === "sm" ? "w-9" : "w-11";
  const inputWidth = size === "sm" ? "w-12" : "w-14";

  function commit(next: number) {
    onChange(clamp(next, min, max));
  }

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div
        className={`flex ${height} w-fit items-center rounded-lg border border-slate-300 bg-white`}
      >
        <button
          type="button"
          onClick={() => commit(value - 1)}
          disabled={value <= min}
          className={`grid ${height} ${buttonWidth} place-items-center text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40`}
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const parsed = Number.parseInt(e.target.value, 10);
            if (!Number.isNaN(parsed)) commit(parsed);
          }}
          onBlur={() => commit(value)}
          className={`${inputWidth} ${height} border-x border-slate-300 bg-transparent text-center text-sm font-bold text-slate-900 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
          aria-label={label ?? "Quantity"}
        />
        <button
          type="button"
          onClick={() => commit(value + 1)}
          disabled={value >= max}
          className={`grid ${height} ${buttonWidth} place-items-center text-slate-500 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40`}
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
