import Link from "next/link";
import { ArrowRight, Shield, Truck, Headphones, Star, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { CategoryCard, IndustryCard } from "@/components/products/category-card";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { prisma } from "@/lib/prisma";
import { getCurrency } from "@/lib/currency-server";

export default async function HomePage() {
  const currency = await getCurrency();

  const [newArrivals, bestSellers, categories, industries, reviews] =
    await Promise.all([
      prisma.product.findMany({
        where: { status: "ACTIVE", isNewArrival: true },
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", isBestSeller: true },
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.industry.findMany({ orderBy: { name: "asc" } }),
      prisma.review.findMany({
        where: { featured: true },
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const trustBadges = [
    { icon: Truck, title: "Free Shipping", desc: "On qualifying orders" },
    { icon: Shield, title: "1 Year Warranty", desc: "Satisfaction guaranteed" },
    { icon: Headphones, title: "Expert Support", desc: "US & Canada based team" },
    { icon: Globe, title: "Nationwide Range", desc: "LTE PoC solutions available" },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-red-900 text-white">
        <div className="container-page grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-red-300">
              Over 25 Years in Two-Way Radio
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Nationwide Walkie-Talkie & Two-Way Radio Solutions
            </h1>
            <p className="mt-4 text-lg text-slate-200">
              Expert programming, fast shipping, and industry-ready kits for
              business, commercial, and professional communication.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/search">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link href="/contact">Talk to an Expert</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <p className="text-sm uppercase tracking-wide text-red-200">Featured</p>
            <h2 className="mt-2 text-2xl font-bold">Motorola TLK110 Nationwide Radio</h2>
            <p className="mt-3 text-slate-200">
              Instant PTT over LTE with centralized management and zero range anxiety.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/products/motorola-tlk110-radio">View Product</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="container-page grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {trustBadges.map((badge) => (
            <div key={badge.title} className="flex items-start gap-3">
              <badge.icon className="mt-1 h-6 w-6 shrink-0 text-red-600" />
              <div>
                <h3 className="font-semibold text-slate-900">{badge.title}</h3>
                <p className="text-sm text-slate-600">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="section-title">Featured Products</h2>
            <p className="mt-2 text-slate-600">Top picks from our catalog</p>
          </div>
          <Link href="/search" className="text-sm font-semibold text-red-600 hover:underline">
            View all
          </Link>
        </div>
        <div className="mb-12">
          <h3 className="mb-4 text-lg font-bold text-slate-900">New Arrivals</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} currency={currency} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-lg font-bold text-slate-900">Best Sellers</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} currency={currency} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <h2 className="section-title">Shop by Category</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} {...category} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="section-title">Built for Your Industry</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <IndustryCard key={industry.id} {...industry} />
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-16 text-white">
        <div className="container-page">
          <h2 className="section-title text-white">Customer Reviews</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {reviews.map((review) => (
              <blockquote
                key={review.id}
                className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
              >
                <div className="mb-3 flex gap-1 text-amber-400">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-200">&ldquo;{review.content}&rdquo;</p>
                <footer className="mt-4 text-sm font-semibold text-white">
                  — {review.author}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="rounded-2xl bg-red-600 px-8 py-12 text-center text-white">
          <h2 className="text-3xl font-bold">Stay Connected</h2>
          <p className="mx-auto mt-3 max-w-xl text-red-100">
            Join our newsletter for product updates, deployment guides, and exclusive offers.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
