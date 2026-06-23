"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { updateOrderStatusAction } from "@/app/actions/admin";
import { ORDER_STATUS_LIST, ORDER_STATUS_META } from "@/lib/order-status";

export function OrderStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(next: OrderStatus) {
    if (next === status) return;
    const formData = new FormData();
    formData.set("id", orderId);
    formData.set("status", next);
    startTransition(async () => {
      await updateOrderStatusAction(formData);
      router.refresh();
    });
  }

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value as OrderStatus)}
      className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
      aria-label="Update order status"
    >
      {ORDER_STATUS_LIST.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_META[s].label}
        </option>
      ))}
    </select>
  );
}
