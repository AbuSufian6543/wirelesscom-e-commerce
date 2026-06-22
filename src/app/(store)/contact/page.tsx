import { SITE_EMAIL, SITE_PHONE } from "@/lib/constants";

export default function ContactPage() {
  return (
    <div className="container-page py-10">
      <h1 className="section-title">Contact Us</h1>
      <div className="mt-8 max-w-2xl prose-store">
        <p>
          Need help choosing the right two-way radio for your team? Our experts are
          ready to help with product selection, programming, and deployment.
        </p>
        <ul className="mt-6 space-y-2">
          <li>
            <strong>Phone:</strong> {SITE_PHONE}
          </li>
          <li>
            <strong>Email:</strong> {SITE_EMAIL}
          </li>
        </ul>
      </div>
    </div>
  );
}
