"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCartItemAction } from "@/app/actions/cart";
import { QuantitySelector } from "@/components/products/quantity-selector";

export function CartItemQuantity({
  itemId,
  quantity,
  max = 99,
}: {
  itemId: string;
  quantity: number;
  max?: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(next: number) {
    const formData = new FormData();
    formData.set("itemId", itemId);
    formData.set("quantity", String(next));
    startTransition(async () => {
      await updateCartItemAction(formData);
      router.refresh();
    });
  }

  return (
    <div className={pending ? "opacity-60" : undefined}>
      <QuantitySelector
        value={quantity}
        onChange={handleChange}
        min={1}
        max={max}
        size="sm"
        id={`cart-qty-${itemId}`}
      />
    </div>
  );
}
