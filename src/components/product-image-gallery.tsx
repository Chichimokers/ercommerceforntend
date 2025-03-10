"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Button, Skeleton } from '@heroui/react';

interface ProductImageGalleryProps {
  images: string[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  selectedIndex = 0,
  onSelect
}) => {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  const [loading, setLoading] = useState(true);

  const handleIndexChange = (newIndex: number) => {
    const safeIndex = ((newIndex % images.length) + images.length) % images.length;
    setCurrentIndex(safeIndex);
    if (onSelect) {
      onSelect(safeIndex);
    }
  };

  const handlePrevious = () => {
    handleIndexChange(currentIndex - 1);
  };

  const handleNext = () => {
    handleIndexChange(currentIndex + 1);
  };

  if (!images.length) {
    images = ['/placeholder.jpg'];
  }

  return (
    <div className="relative">
      <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
        {loading && (
          <Skeleton className="absolute inset-0 z-0" />
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <Image
              src={images[currentIndex]}
              alt={`Product image ${currentIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
              priority={currentIndex === 0}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows for large screens */}
        {images.length > 1 && (
          <>
            <Button
              isIconOnly
              variant="flat"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-black/50 z-10 shadow-md rounded-full"
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <FaArrowLeft className="text-gray-700 dark:text-gray-300" />
            </Button>
            <Button
              isIconOnly
              variant="flat"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-black/50 z-10 shadow-md rounded-full"
              onPress={handleNext}
              aria-label="Next image"
            >
              <FaArrowRight className="text-gray-700 dark:text-gray-300" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-flow-col auto-cols-max gap-2 overflow-x-auto pb-2 snap-x">
          {images.map((src, index) => (
            <button
              key={index}
              className={`relative w-16 h-16 rounded-md overflow-hidden snap-start ${index === currentIndex
                ? 'ring-2 ring-blue-500 ring-offset-2'
                : 'ring-1 ring-gray-200 dark:ring-gray-700'
                }`}
              onClick={() => handleIndexChange(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === currentIndex}
            >
              <Image
                src={src}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;