"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/lib/store/useCartStore";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export function ProductDetailsClient({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Store
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
              No Image
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <div className="mb-6">
            <h1 className="text-4xl font-black uppercase tracking-tight text-[#001a41]">{product.name}</h1>
            <p className="text-2xl font-bold text-emerald-600 mt-4">₱{Number(product.price).toLocaleString()}</p>
          </div>

          <div className="prose prose-sm sm:prose-base text-gray-600 mb-8 max-w-none">
            {product.description ? (
              <p className="whitespace-pre-wrap">{product.description}</p>
            ) : (
              <p>Premium quality meat cut, carefully selected and handled to ensure maximum flavor and tenderness for your cooking needs.</p>
            )}
          </div>

          {/* Add to Cart Controls */}
          <div className="mt-auto pt-8 border-t border-gray-200">
            <div className="flex items-center gap-6 mb-6">
              <span className="font-semibold text-gray-700">Quantity</span>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-gray-500 hover:text-gray-900 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-gray-500 hover:text-gray-900 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              className="w-full h-14 text-lg font-bold uppercase tracking-wider rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
