"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/mock-data";
import { Search, PackageX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProductGrid({ products }: { products: Product[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Dynamically extract all unique categories from the available products
  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ["All", ...uniqueCats];
  }, [products]);

  // Filter products based on search query AND selected category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Category Tabs */}
        <div className="flex-1 w-full overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === category
                    ? "bg-[#001a41] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search for cuts..."
            className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-full focus-visible:ring-[#001a41]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <PackageX className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-[#001a41] mb-2">No cuts found</h3>
          <p className="text-gray-500 max-w-md mb-6">
            We couldn't find any products matching "{searchQuery}" in the "{selectedCategory}" category.
          </p>
          <Button 
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="bg-yellow-500 hover:bg-yellow-400 text-[#001a41] font-bold"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
