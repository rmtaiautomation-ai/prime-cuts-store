import { CheckoutClient } from "./CheckoutClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Checkout | PrimeCuts PH",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-white">
      <CheckoutClient />
    </div>
  );
}
