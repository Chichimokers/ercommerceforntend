import Image from "next/image";

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
        src={src}
        alt={alt}
        fill
        className={`object-cover ${className}`}
        quality={50}
        {...imageLoadingProps}
        placeholder="empty"
      />
    </div>
  );
}