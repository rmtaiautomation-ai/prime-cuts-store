import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, Package, Truck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Order Confirmed | PrimeCuts PH",
  description: "Thank you for your order",
};

// We use searchParams in a server component to get the order ID
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { order_id } = await searchParams;
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 py-6 px-4 sm:px-6 lg:px-8 flex justify-center">
        <Link href="/" className="inline-flex items-center gap-2 text-[#001a41] hover:opacity-80 transition-opacity font-black uppercase tracking-widest text-2xl">
          PrimeCuts PH
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="bg-white shadow-sm sm:rounded-2xl p-8 sm:p-12 text-center border border-gray-100">
          
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="w-16 h-16 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-2">
            Thank you for your order!
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            Your premium cuts are being prepared. You will receive an email confirmation shortly with your receipt and tracking details.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left border border-gray-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Order Summary</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Reference</p>
                <p className="font-mono font-medium text-gray-900">{order_id || 'Generating...'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Status</p>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
                  <span className="font-medium text-gray-900">Processing</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 text-left p-4 rounded-lg bg-blue-50/50 border border-blue-100">
              <Package className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Preparing your cuts</h3>
                <p className="text-sm text-gray-500 mt-1">Our expert butchers are carefully preparing and packaging your order to ensure maximum freshness.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left p-4 rounded-lg border border-gray-100 opacity-60">
              <Truck className="w-6 h-6 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Out for delivery</h3>
                <p className="text-sm text-gray-500 mt-1">You'll receive a text message from our rider once your order is on the way.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button render={<Link href="/" />} className="h-12 px-8 bg-[#001a41] hover:bg-[#002a66] text-white font-bold rounded-md">
                Continue Shopping
            </Button>
            <Button render={<Link href="/account" />} variant="outline" className="h-12 px-8 border-gray-300 text-gray-700 font-bold rounded-md hover:bg-gray-50">
                View Order History
            </Button>
          </div>
          
        </div>
      </main>
    </div>
  );
}
