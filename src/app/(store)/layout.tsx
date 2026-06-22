import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getOrCreateCart } from "@/lib/cart";
import { getCurrency } from "@/lib/currency-server";

export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, currency] = await Promise.all([getOrCreateCart(), getCurrency()]);
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Header cartCount={cartCount} currency={currency} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
