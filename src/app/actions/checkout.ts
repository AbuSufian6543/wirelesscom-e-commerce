"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart, getVariantLabel } from "@/lib/cart";
import { getCurrency } from "@/lib/currency-server";
import { getProductPrice, getVariantPrice } from "@/lib/currency";
import { getShippingCents } from "@/lib/constants";
import { generateOrderNumber } from "@/lib/utils";
import { createPayPalOrder, capturePayPalOrder } from "@/lib/paypal";

export async function createCheckoutOrderAction(formData: FormData) {
  const session = await auth();
  const currency = await getCurrency();
  const cart = await getOrCreateCart();

  if (!cart.items.length) {
    return { error: "Your cart is empty." };
  }

  const shippingName = String(formData.get("shippingName") ?? "").trim();
  const shippingLine1 = String(formData.get("shippingLine1") ?? "").trim();
  const shippingLine2 = String(formData.get("shippingLine2") ?? "").trim() || null;
  const shippingCity = String(formData.get("shippingCity") ?? "").trim();
  const shippingState = String(formData.get("shippingState") ?? "").trim();
  const shippingPostal = String(formData.get("shippingPostal") ?? "").trim();
  const shippingCountry = String(formData.get("shippingCountry") ?? "CA").trim();
  const guestEmail = String(formData.get("guestEmail") ?? "").trim() || null;

  if (!shippingName || !shippingLine1 || !shippingCity || !shippingState || !shippingPostal) {
    return { error: "Please complete all required shipping fields." };
  }

  if (!session?.user && !guestEmail) {
    return { error: "Email is required for guest checkout." };
  }

  let subtotalCents = 0;
  const orderItems: Array<{
    productId: string;
    variantId: string | null;
    productName: string;
    variantLabel: string | null;
    sku: string | null;
    quantity: number;
    unitPriceCents: number;
  }> = [];

  for (const item of cart.items) {
    const pricing = item.variant
      ? getVariantPrice(item.variant, item.product, currency)
      : getProductPrice(item.product, currency);

    if (item.variant && item.variant.stock < item.quantity) {
      return { error: `${item.product.name} is out of stock.` };
    }

    if (!item.variant && !item.product.hasVariants && item.quantity > 99) {
      return { error: "Invalid quantity." };
    }

    subtotalCents += pricing.currentCents * item.quantity;
    orderItems.push({
      productId: item.productId,
      variantId: item.variantId,
      productName: item.product.name,
      variantLabel: getVariantLabel(item.variant),
      sku: item.variant?.sku ?? null,
      quantity: item.quantity,
      unitPriceCents: pricing.currentCents,
    });
  }

  const shippingCents = getShippingCents(subtotalCents, currency);
  const totalCents = subtotalCents + shippingCents;
  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session?.user?.id ?? null,
      guestEmail,
      currency,
      subtotalCents,
      shippingCents,
      totalCents,
      shippingName,
      shippingLine1,
      shippingLine2,
      shippingCity,
      shippingState,
      shippingPostal,
      shippingCountry,
      items: {
        create: orderItems,
      },
    },
  });

  try {
    const paypalOrderId = await createPayPalOrder({
      totalCents,
      currency,
      orderNumber,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paypalOrderId },
    });

    return { orderId: order.id, paypalOrderId };
  } catch {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    return { error: "Unable to initialize PayPal checkout. Check PayPal credentials." };
  }
}

export async function captureCheckoutOrderAction(orderId: string, paypalOrderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.paypalOrderId !== paypalOrderId) {
    return { error: "Invalid order." };
  }

  if (order.status === "PAID") {
    return { success: true, orderNumber: order.orderNumber };
  }

  try {
    const capture = await capturePayPalOrder(paypalOrderId);

    if (capture.status !== "COMPLETED") {
      return { error: "Payment was not completed." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paypalCaptureId: capture.captureId,
        },
      });

      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      const cart = await tx.cart.findFirst({
        where: order.userId ? { userId: order.userId } : undefined,
      });

      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    });

    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { success: true, orderNumber: order.orderNumber };
  } catch {
    return { error: "Failed to capture payment." };
  }
}

export async function cancelCheckoutOrderAction(orderId: string) {
  await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
}
