import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/admin/login");

  const orders = await prisma.order.findMany({
    include: { items: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Orders</h1>
      <div className="mt-6 space-y-4">
        {orders.length === 0 ? (
          <p className="text-slate-600">No orders yet.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{order.orderNumber}</p>
                  <p className="text-sm text-slate-500">
                    {order.user?.email ?? order.guestEmail ?? "Guest"} ·{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatPrice(order.totalCents, order.currency)}
                  </p>
                  <p className="text-sm capitalize">{order.status.toLowerCase()}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold">Shipping</p>
                  <p className="text-sm text-slate-600">
                    {order.shippingName}
                    <br />
                    {order.shippingLine1}
                    {order.shippingLine2 && (
                      <>
                        <br />
                        {order.shippingLine2}
                      </>
                    )}
                    <br />
                    {order.shippingCity}, {order.shippingState}{" "}
                    {order.shippingPostal}
                    <br />
                    {order.shippingCountry}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Items</p>
                  <ul className="text-sm text-slate-600">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.quantity}x {item.productName}
                        {item.variantLabel ? ` (${item.variantLabel})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
