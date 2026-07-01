import { ProductSkeleton } from "./ProductSkeleton";

export function ProductGridSkeleton() {
  return (
    <div className="space-y-8">
      {/* Mock Search/Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
        <div className="flex gap-2">
          <div className="h-9 w-20 bg-gray-200 rounded-full"></div>
          <div className="h-9 w-24 bg-gray-200 rounded-full"></div>
          <div className="h-9 w-24 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-10 w-full md:w-72 bg-gray-200 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
