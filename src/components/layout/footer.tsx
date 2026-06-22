import Link from "next/link";
import { SITE_EMAIL, SITE_NAME, SITE_PHONE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="container-page grid gap-8 py-12 md:grid-cols-4">
        <div>
          <h3 className="mb-3 text-lg font-bold text-white">{SITE_NAME}</h3>
          <p className="text-sm leading-relaxed">
            Expert two-way radio solutions with fast shipping, programming support,
            and industry-ready kits.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/categories/business-radios" className="hover:text-white">Business Radios</Link></li>
            <li><Link href="/categories/commercial-radios" className="hover:text-white">Commercial Radios</Link></li>
            <li><Link href="/categories/accessories" className="hover:text-white">Accessories</Link></li>
            <li><Link href="/search" className="hover:text-white">All Products</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            <li><Link href="/shipping" className="hover:text-white">Shipping Policy</Link></li>
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li>{SITE_PHONE}</li>
            <li>{SITE_EMAIL}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
