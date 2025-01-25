import { Skeleton } from "@heroui/react";

const FiltersSkeleton = () => {
  return (
    <div className="h-max space-y-6">
      <div className="space-y-2">
        <Skeleton className="w-24 h-5 rounded-lg" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="w-32 h-4 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="w-28 h-5 rounded-lg" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="w-28 h-4 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="w-24 h-5 rounded-lg" />
        <Skeleton className="w-full h-6 rounded-lg" />
      </div>

      <div className="space-y-2">
        <Skeleton className="w-28 h-5 rounded-lg" />
        <Skeleton className="w-full h-12 rounded-lg" />
      </div>
    </div>
  );
};

export default FiltersSkeleton;
