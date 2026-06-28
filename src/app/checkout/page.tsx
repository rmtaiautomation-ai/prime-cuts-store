import { CheckoutClient } from "./CheckoutClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Checkout | PrimeCuts PH",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 py-6 px-4 md:px-12 bg-white flex justify-center md:justify-start">
        <Link href="/cart" className="inline-flex items-center gap-2 text-[#001a41] hover:opacity-80 transition-opacity font-black uppercase tracking-widest text-2xl">
          <ArrowLeft className="h-5 w-5 md:hidden" />
          PrimeCuts PH
        </Link>
      </header>
      <CheckoutClient />
    </div>
  );
}
