import Link from "next/link";
import { Radio } from "lucide-react";
import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-100">
      {session?.user?.role === "ADMIN" && (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2 font-bold text-slate-900">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white">
                  <Radio className="h-4 w-4" />
                </span>
                Admin Panel
              </Link>
              <AdminNav />
            </div>
            <Link
              href="/"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
            >
              View Store
            </Link>
          </div>
        </header>
      )}
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  );
}
