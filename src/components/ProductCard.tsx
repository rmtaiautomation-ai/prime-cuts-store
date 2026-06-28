"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/mock-data";
import { useCartStore } from "@/lib/store/useCartStore";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart!`, {
      description: "You can view your items in the cart drawer.",
      position: "top-center"
    });
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
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 opacity-95 group-hover:opacity-100"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <CardHeader className="p-5 pb-2">
        <h3 className="font-heading text-lg font-bold leading-tight tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
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
    </Card>
  );
}
