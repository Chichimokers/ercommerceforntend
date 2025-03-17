interface SectionSkeletonProps {
  height?: string;
}

export default function SectionSkeleton({ height = "200px" }: SectionSkeletonProps) {
  return (
    <div
      className="w-full bg-gray-100 dark:bg-gray-700 animate-pulse rounded-xl"
      style={{ height }}
    />
  );
}