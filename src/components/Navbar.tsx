"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, User } from "lucide-react";
import { CartSheet } from "@/components/CartSheet";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";

export function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        const currentScrollY = window.scrollY;
        
        // Hide if scrolling down past 80px, show if scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY) {
          setIsVisible(true);
        }
        
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`sticky top-0 z-50 w-full border-b border-border bg-[#001a41] shadow-sm transition-transform duration-300 ease-in-out ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="container mx-auto px-4 h-20 flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center">
              <span className="bg-white text-[#001a41] px-2 py-1 rounded-md mr-1">SAFE</span>
              SELECT
            </Link>
          </div>
          
          <div className="hidden lg:flex flex-1 justify-center max-w-2xl px-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search"
                className="w-full bg-[#112a52] text-white placeholder-gray-400 border border-white/20 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button className="hidden sm:flex items-center gap-2 bg-white text-[#001a41] hover:bg-white/90 font-bold rounded-full px-5 h-10" render={<Link href="/account" />}>
              <User className="h-4 w-4" />
              <span className="hidden md:inline">Log in</span>
            </Button>
            
            <div className="text-white">
              <CartSheet />
            </div>
          </div>
        </div>
      </div>

      {/* Sub navigation bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="hidden lg:flex justify-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-6 h-12">
                <NavigationMenuItem>
                  <Link href="/" className="text-xs font-bold text-white/90 hover:text-white uppercase tracking-wider">Home</Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-xs font-bold text-white/90 hover:text-white uppercase tracking-wider px-0 hover:bg-transparent data-[state=open]:bg-transparent">Shop All</NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-xs font-bold text-white/90 hover:text-white uppercase tracking-wider px-0 hover:bg-transparent data-[state=open]:bg-transparent">Meat</NavigationMenuTrigger>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="#" className="text-xs font-bold text-white/90 hover:text-white uppercase tracking-wider">Seafood</Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="#" className="text-xs font-bold text-white/90 hover:text-white uppercase tracking-wider">Dimsum</Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="#" className="text-xs font-bold text-white/90 hover:text-white uppercase tracking-wider">Fruits</Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="#" className="text-xs font-bold text-white/90 hover:text-white uppercase tracking-wider">Pasta & Pasta Sauce</Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="#" className="text-xs font-bold text-white/90 hover:text-white uppercase tracking-wider">Add-Ons</Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="#" className="text-xs font-bold text-white/90 hover:text-white uppercase tracking-wider">Gift Set</Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="#" className="text-xs font-bold text-white/90 hover:text-white uppercase tracking-wider">Bundles</Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="#" className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-wider">Sale</Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
