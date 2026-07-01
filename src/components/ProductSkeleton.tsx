export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-gray-200"></div>
      
      {/* Content Skeleton */}
      <div className="p-5 flex flex-col h-[280px]">
        {/* Category & Badge */}
        <div className="flex justify-between items-start mb-3">
          <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
        </div>
        
        {/* Title */}
        <div className="h-6 w-3/4 bg-gray-200 rounded-md mb-2"></div>
        <div className="h-6 w-1/2 bg-gray-200 rounded-md mb-4"></div>
        
        {/* Description */}
        <div className="h-4 w-full bg-gray-100 rounded-md mb-2"></div>
        <div className="h-4 w-5/6 bg-gray-100 rounded-md mb-4"></div>
        
        <div className="mt-auto">
          {/* Price */}
          <div className="h-7 w-24 bg-gray-200 rounded-md mb-4"></div>
          
          {/* Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-gray-50 border-gray-100 border rounded-full px-2 py-1 w-32 h-10"></div>
            <div className="h-10 flex-1 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
