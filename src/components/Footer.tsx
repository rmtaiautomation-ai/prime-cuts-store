"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronUp, Gift } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";

export function Footer() {
  const pathname = usePathname();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (pathname === "/checkout") return null;

  return (
    <footer className="w-full bg-white border-t border-border mt-auto">
      {/* Back on top bar */}
      <div 
        className="w-full bg-gray-100 py-3 text-center cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={scrollToTop}
      >
        <span className="text-sm font-medium text-gray-600 flex items-center justify-center gap-2">
          Back on top <ChevronUp className="h-4 w-4" />
        </span>
      </div>

      <div className="container mx-auto px-4 py-12 lg:py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#111827] uppercase tracking-wide text-sm">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-gray-600 hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">Retail Store Locations</Link></li>
              <li><Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">Rewards</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#111827] uppercase tracking-wide text-sm">Help</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Learn More */}
          <div className="space-y-4">
            <h4 className="font-bold text-[#111827] uppercase tracking-wide text-sm">Learn More</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">Cooking Guide</Link></li>
              <li><Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <p className="text-sm text-gray-600 font-medium">Subscribe to get special offers and exclusive discounts!</p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Email" 
                className="bg-white border-gray-300 focus-visible:ring-primary h-10"
              />
              <Button className="bg-[#111827] text-white hover:bg-gray-800 h-10 px-6 font-semibold rounded-md">
                Subscribe
              </Button>
            </div>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="text-gray-600 hover:text-[#111827] transition-colors">
                <FaFacebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-[#111827] transition-colors">
                <FaInstagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 bg-white">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl">
          <div className="text-[11px] text-gray-500 flex flex-wrap justify-center md:justify-start gap-x-3 gap-y-1">
            <span>© 2026 PrimeCuts PH</span>
            <span>•</span>
            <Link href="#" className="hover:text-primary transition-colors">Refund policy</Link>
            <span>•</span>
            <Link href="#" className="hover:text-primary transition-colors">Privacy policy</Link>
            <span>•</span>
            <Link href="#" className="hover:text-primary transition-colors">Terms of service</Link>
            <span>•</span>
            <Link href="#" className="hover:text-primary transition-colors">Shipping policy</Link>
            <span>•</span>
            <Link href="#" className="hover:text-primary transition-colors">Contact information</Link>
          </div>
        </div>
      </div>

      {/* Floating Rewards Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="bg-[#18345c] hover:bg-[#11233e] text-white rounded-full shadow-lg h-14 px-6 flex items-center gap-2 transition-transform hover:scale-105">
          <Gift className="h-5 w-5" />
          <span className="font-semibold text-sm">Rewards</span>
        </Button>
      </div>
    </footer>
  );
}
