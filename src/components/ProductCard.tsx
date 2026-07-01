"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/lib/mock-data";
import { useCartStore } from "@/lib/store/useCartStore";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const totalItems = getTotalItems();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCart = () => {
    addItem(product, 1);
    setIsModalOpen(true);
  };

  const formattedPrice = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(product.price);

  return (
    <Card className="overflow-hidden bg-card border-border hover:shadow-xl hover:border-primary/30 transition-all duration-300 group flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.isFeatured && (
          <Badge className="absolute top-3 right-3 z-10 bg-primary hover:bg-primary text-primary-foreground shadow-sm border-none font-semibold tracking-wider text-[10px] uppercase">
            Featured
          </Badge>
        )}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="outline" className="bg-white/90 backdrop-blur-md border-border/50 text-foreground font-medium text-[10px] uppercase tracking-wider">
            {product.category}
          </Badge>
        </div>
        <Link href={`/product/${product.id}`}>
          <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 opacity-95 group-hover:opacity-100"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </Link>
      </div>
      
      <CardHeader className="p-5 pb-2">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-heading text-lg font-bold leading-tight tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>
        <p className="text-xl font-bold text-primary mt-1">
          {formattedPrice} <span className="text-xs text-muted-foreground font-medium">/ kg</span>
        </p>
      </CardHeader>
      
      <CardContent className="p-5 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-5 pt-0 flex flex-col gap-3">
        <div className="w-full flex justify-between items-center text-xs font-semibold">
          <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Stock Status</span>
          {product.stockQuantity > 10 ? (
            <span className="text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-sm dark:text-emerald-400">In Stock ({product.stockQuantity})</span>
          ) : product.stockQuantity > 0 ? (
            <span className="text-amber-600 bg-amber-500/10 px-2 py-1 rounded-sm dark:text-amber-400">Low Stock ({product.stockQuantity})</span>
          ) : (
            <span className="text-destructive bg-destructive/10 px-2 py-1 rounded-sm">Out of Stock</span>
          )}
        </div>
        <Button 
          onClick={handleAddToCart}
          disabled={product.stockQuantity === 0}
          className={`w-full font-semibold transition-all duration-300 group/btn border-none ${
            product.stockQuantity === 0 
              ? "bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed" 
              : "bg-muted text-foreground hover:bg-primary hover:text-primary-foreground"
          }`}
        >
          <ShoppingCart className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform" />
          {product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>

      {/* Centered Minimalist Modal for Add to Cart Success (Matching Image) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[380px] bg-white border-0 shadow-2xl p-0 rounded-none overflow-hidden [&>button]:right-4 [&>button]:top-4">
          <div className="flex items-center px-5 py-4 border-b border-gray-100">
            <Check className="h-4 w-4 mr-2 text-black" strokeWidth={3} />
            <span className="text-[11px] font-medium tracking-widest text-black uppercase">
              Item added to your cart
            </span>
          </div>
          
          <div className="flex gap-4 p-5">
            <div className="relative w-20 h-20 border border-gray-100 bg-white flex-shrink-0">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover p-1"
              />
            </div>
            <div className="flex flex-col pt-1">
              <h4 className="text-sm tracking-wide text-black uppercase leading-tight">
                {product.name}
              </h4>
              <p className="text-xs text-gray-500 mt-2">
                Category: {product.category.toUpperCase()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Price: {formattedPrice}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 p-5 pt-2">
            <Button 
              variant="outline" 
              render={<Link href="/cart" />} 
              className="w-full rounded-none border-black text-black hover:bg-gray-50 h-12 font-normal text-sm"
            >
              View cart ({totalItems})
            </Button>
            <Button 
              render={<Link href="/checkout" />} 
              className="w-full rounded-none bg-[#111] hover:bg-black text-white h-12 font-normal text-sm"
            >
              Check out
            </Button>
            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-full mt-1 text-sm underline text-gray-600 hover:text-black transition-colors py-2"
            >
              Continue shopping
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
