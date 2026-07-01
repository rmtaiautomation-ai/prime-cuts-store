"use client";

import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useCartStore } from "@/lib/store/useCartStore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CartSheet({ mobile = false }: { mobile?: boolean }) {
  const [isMounted, setIsMounted] = useState(false);
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice } = useCartStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalItems = isMounted ? getTotalItems() : 0;
  const totalPrice = isMounted ? getTotalPrice() : 0;
  const displayItems = isMounted ? items : [];

  const formattedTotal = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(totalPrice);

  return (
    <Sheet>
      <SheetTrigger 
        render={
          mobile ? (
            <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100">
              <ShoppingCart className="h-4 w-4 text-[#001a41]" />
              My Cart {totalItems > 0 && `(${totalItems})`}
            </button>
          ) : (
            <Button className="flex items-center gap-2 bg-white text-[#001a41] hover:bg-white/90 font-bold rounded-full px-5 h-10">
              <ShoppingCart className="h-4 w-4" />
              <span>
                {totalItems > 0 ? `₱${totalPrice.toLocaleString()} (${totalItems})` : "Cart"}
              </span>
            </Button>
          )
        }
      />
      <SheetContent className="border-border w-full sm:max-w-lg flex flex-col h-full bg-background">
        <SheetHeader>
          <SheetTitle className="text-foreground">Your Cart ({totalItems})</SheetTitle>
        </SheetHeader>
        
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-grow space-y-4 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 opacity-20" />
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2">
              {displayItems.map((item) => (
                <div key={item.product.id} className="flex gap-4 border-b border-border pb-4">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                    <Image 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h4 className="font-bold text-sm line-clamp-1">{item.product.name}</h4>
                    <p className="text-primary font-bold text-sm mt-1">
                      ₱{item.product.price.toLocaleString()} <span className="text-muted-foreground text-xs font-normal">/ kg</span>
                    </p>
                    
                    <div className="flex items-center gap-2 mt-auto">
                      <div className="flex items-center border border-border rounded-md">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-none"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-none"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-border mt-auto pb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl text-primary">{formattedTotal}</span>
              </div>
              <SheetClose 
                nativeButton={false}
                render={
                  <Button render={<Link href="/cart" />} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 text-lg">
                    View Cart
                  </Button>
                }
              />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
