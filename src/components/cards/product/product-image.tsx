import Image from "next/image";

const PLACEHOLDER = "/placeholder.webp";
const ASPECT_RATIO = "aspect-square";

interface ProductImageProps {
  src: string;
  alt: string;
  lazyLoad?: boolean;
  className?: string;
}

export default function ProductImage({
  src,
  alt,
  lazyLoad = true,
  className = "",
}: ProductImageProps) {
  const imageLoadingProps = lazyLoad
    ? { loading: "lazy" as const, priority: false }
    : { loading: "eager" as const, priority: true };

  return (
    <div className={`relative w-full ${ASPECT_RATIO} bg-gray-100 dark:bg-gray-700 overflow-hidden`}>
      <Image
        src={src || PLACEHOLDER}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className={`object-cover ${className}`}
        quality={65}
        {...imageLoadingProps}
        placeholder="empty"
        onError={(e) => {
          (e.target as HTMLImageElement).src = PLACEHOLDER;
        }}
      />
    </div>
  );
}