"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const totalPrice = getTotalPrice();
  
  const FREE_SHIPPING_THRESHOLD = 300;
  const awayFromFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);
  const progressPercentage = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);

  const formattedTotal = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  });

  return (
    <div className="min-h-[60vh] bg-background py-10 md:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
          <h1 className="text-4xl font-black text-[#111827] uppercase tracking-tight mb-4 sm:mb-0">
            Your Cart
          </h1>
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-primary underline underline-offset-4">
            Continue shopping
          </Link>
        </div>

        {/* Free Shipping Progress */}
        <div className="mb-10 text-center">
          {awayFromFreeShipping > 0 ? (
            <p className="text-sm text-gray-600 mb-3">
              You're <span className="font-bold text-primary">{formattedTotal.format(awayFromFreeShipping)}</span> away from free shipping!
            </p>
          ) : (
            <p className="text-sm font-bold text-primary mb-3">
              Congratulations! You've unlocked free shipping!
            </p>
          )}
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#001a41] h-full transition-all duration-500 ease-in-out rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Cart Table */}
        {items.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <h2 className="text-xl font-semibold text-gray-600 mb-4">Your cart is currently empty.</h2>
            <Button render={<Link href="/" />} className="bg-[#001a41] text-white hover:bg-[#002a66]">
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="w-full">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.product.id} className="py-6 flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center">
                  
                  {/* Product Column */}
                  <div className="col-span-6 flex gap-6 mb-4 md:mb-0">
                    <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image 
                        src={item.product.imageUrl} 
                        alt={item.product.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="font-bold text-[#111827] text-base md:text-lg uppercase leading-tight mb-1">
                        {item.product.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-2">{formattedTotal.format(item.product.price)}</p>
                      <p className="text-gray-400 text-xs line-clamp-2 pr-4">{item.product.description}</p>
                    </div>
                  </div>

                  {/* Quantity Column */}
                  <div className="col-span-3 flex justify-between md:justify-center items-center mb-4 md:mb-0">
                    <span className="md:hidden text-xs font-semibold text-gray-400 uppercase">Quantity</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-300 rounded-full bg-white overflow-hidden shadow-sm">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-none text-gray-500 hover:text-[#111827] hover:bg-gray-100"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold text-[#111827]">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-none text-gray-500 hover:text-[#111827] hover:bg-gray-100"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <button 
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2"
                        title="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Total Column */}
                  <div className="col-span-3 flex justify-between md:justify-end items-center">
                    <span className="md:hidden text-xs font-semibold text-gray-400 uppercase">Total</span>
                    <span className="font-bold text-[#111827] text-base md:text-lg">
                      {formattedTotal.format(item.product.price * item.quantity)}
                    </span>
                  </div>

                </div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="w-full md:w-1/2">
                <p className="text-sm text-gray-500">
                  Taxes and shipping calculated at checkout.
                </p>
              </div>
              <div className="w-full md:w-auto flex flex-col items-end">
                <div className="flex justify-between w-full md:w-auto gap-12 mb-4">
                  <span className="text-xl font-bold text-[#111827]">Subtotal</span>
                  <span className="text-2xl font-black text-primary">{formattedTotal.format(totalPrice)}</span>
                </div>
                <Button render={<Link href="/checkout" />} className="w-full bg-[#001a41] hover:bg-[#002a66] text-white font-bold h-14 px-12 text-lg rounded-md shadow-md transition-transform hover:scale-[1.02]">
                  Check out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
