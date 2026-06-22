import { ProductCard } from "@/components/products/product-card";
import { prisma } from "@/lib/prisma";
import { getCurrency } from "@/lib/currency-server";
import { SearchForm } from "@/components/forms/search-form";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const currency = await getCurrency();
  const query = q.trim();

  const products = query
    ? await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { brand: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { name: "asc" },
      })
    : await prisma.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: { name: "asc" },
      });

  return (
    <div className="container-page py-10">
      <h1 className="section-title">Search Products</h1>
      <div className="mt-6 max-w-xl">
        <SearchForm initialQuery={query} />
      </div>
      <p className="mt-4 text-sm text-slate-600">
        {products.length} product{products.length === 1 ? "" : "s"} found
        {query ? ` for "${query}"` : ""}
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} currency={currency} />
        ))}
      </div>
    </div>
  );
}
