import { redirect } from "next/navigation";
import { CheckoutClient } from "@/components/checkout/checkout-client";
import { auth } from "@/lib/auth";
import { getOrCreateCart } from "@/lib/cart";
import { getCurrency } from "@/lib/currency-server";
import { getProductPrice, getVariantPrice } from "@/lib/currency";
import { getShippingCents } from "@/lib/constants";

export default async function CheckoutPage() {
  const session = await auth();
  const [cart, currency] = await Promise.all([getOrCreateCart(), getCurrency()]);

  if (!cart.items.length) {
    redirect("/cart");
  }

  let subtotalCents = 0;
  for (const item of cart.items) {
    const pricing = item.variant
      ? getVariantPrice(item.variant, item.product, currency)
      : getProductPrice(item.product, currency);
    subtotalCents += pricing.currentCents * item.quantity;
  }

  const shippingCents = getShippingCents(subtotalCents, currency);
  const totalCents = subtotalCents + shippingCents;

  return (
    <div className="container-page py-10">
      <h1 className="section-title">Checkout</h1>
      <div className="mt-8">
        <CheckoutClient
          currency={currency}
          subtotalCents={subtotalCents}
          shippingCents={shippingCents}
          totalCents={totalCents}
          isLoggedIn={!!session?.user}
          userEmail={session?.user?.email}
          userName={session?.user?.name}
          paypalClientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""}
        />
      </div>
    </div>
  );
}
