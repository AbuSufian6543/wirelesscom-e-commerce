import Link from "next/link";
import { ArrowRight } from "lucide-react";

type CategoryCardProps = {
  name: string;
  slug: string;
  description?: string | null;
};

export function CategoryCard({ name, slug, description }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${slug}`}
      className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-red-200 hover:shadow-md"
    >
      <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600">
        {name}
      </h3>
      {description && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{description}</p>
      )}
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-red-600">
        Shop now <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

export function IndustryCard({ name, slug, description }: CategoryCardProps) {
  return (
    <Link
      href={`/industries/${slug}`}
      className="group rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm transition hover:border-red-200 hover:shadow-md"
    >
      <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600">
        {name}
      </h3>
      {description && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{description}</p>
      )}
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-red-600">
        View solutions <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
