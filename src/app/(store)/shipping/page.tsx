import {
  FREE_SHIPPING_THRESHOLD_CAD_CENTS,
  FREE_SHIPPING_THRESHOLD_USD_CENTS,
} from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export default function ShippingPage() {
  return (
    <div className="container-page py-10">
      <h1 className="section-title">Shipping Policy</h1>
      <div className="mt-8 max-w-2xl prose-store space-y-4">
        <p>
          We ship to the United States and Canada. Orders are processed within 1-2
          business days from our fulfillment center.
        </p>
        <p>
          Free shipping is available on orders over{" "}
          {formatPrice(FREE_SHIPPING_THRESHOLD_USD_CENTS, "USD")} (US) or{" "}
          {formatPrice(FREE_SHIPPING_THRESHOLD_CAD_CENTS, "CAD")} (Canada).
        </p>
        <p>
          Standard shipping typically arrives within 3-7 business days depending on
          your location. Tracking information is provided once your order ships.
        </p>
      </div>
    </div>
  );
}
