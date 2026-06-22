import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="container-page py-16 text-center">
      <div className="mx-auto max-w-lg rounded-2xl border border-green-200 bg-green-50 p-10">
        <h1 className="text-3xl font-bold text-green-800">Thank You!</h1>
        <p className="mt-4 text-slate-700">
          Your order has been placed successfully.
        </p>
        {order && (
          <p className="mt-2 font-semibold text-slate-900">
            Order number: {order}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link href="/search">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account/orders">View Orders</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
