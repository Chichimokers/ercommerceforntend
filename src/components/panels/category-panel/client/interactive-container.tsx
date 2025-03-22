"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import CategoryGrid from "../category-grid";
import ScrollIndicator from "./scroll-indicator";
import LocationModal from "@/components/modals/location-modal";
import { useDisclosure } from "@heroui/react";
import debounce from "lodash.debounce";
import { useProductContext } from "@contexts/product-context";

export default function InteractiveContainer() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);

  const [shouldCenterItems, setShouldCenterItems] = useState(true);
  const [isMobile, setIsMobile] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { categories } = useProductContext();

  const checkForScrollPosition = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

    const scrollPercentage = Math.min(
      scrollLeft / Math.max(1, scrollWidth - clientWidth),
      0.98
    );

    setScrollPosition(scrollPercentage);

    const totalCategWidth = (categories.length + 1) * 148;
    setShouldCenterItems(clientWidth >= totalCategWidth);
  }, [categories.length]);

  const debouncedCheck = useMemo(
    () => debounce(checkForScrollPosition, 100, { leading: true }),
    [checkForScrollPosition]
  );

  useEffect(() => {
    const checkForMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);

      if (isMobileDevice && scrollTrackRef.current) {
        scrollTrackRef.current.style.display = 'block';
      } else if (scrollTrackRef.current) {
        scrollTrackRef.current.style.display = 'none';
      }
    };

    checkForMobile();
    checkForScrollPosition();

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        checkForMobile();
        checkForScrollPosition();
      });

      if (containerRef.current) resizeObserver.observe(containerRef.current);

      return () => resizeObserver.disconnect();
    }

    window.addEventListener('resize', checkForMobile);
    return () => window.removeEventListener('resize', checkForMobile);
  }, [checkForScrollPosition]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      if (!isScrolling) {
        setIsScrolling(true);
        requestAnimationFrame(() => {
          const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
          const maxScroll = scrollWidth - clientWidth;

          if (scrollLeft <= 2) {
            setScrollPosition(0);
          } else if (scrollLeft >= maxScroll - 5) {
            setScrollPosition(1);
          } else {
            setScrollPosition(scrollLeft / maxScroll);
          }

          setIsScrolling(false);
        });
      }
    };

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });

    const handleTouchEnd = () => {
      setTimeout(() => {
        const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
        const maxScroll = scrollWidth - clientWidth;

        if (scrollLeft >= maxScroll - 10) {
          setScrollPosition(1);
        }
      }, 50);
    };

    scrollElement.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      scrollElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleLocationNeeded = useCallback(() => {
    onOpen();
  }, [onOpen]);

  return (
    <div ref={containerRef} className="relative">
      {isOpen && (
        <LocationModal
          open={isOpen}
          onClose={onClose}
          initialProvince=""
          initialMunicipality=""
        />
      )}

      <div
        ref={scrollRef}
        className={`
          relative flex overflow-x-auto gap-3 sm:gap-4 py-3 px-2 sm:py-4 sm:px-6 pb-8 sm:pb-12
          snap-x snap-mandatory scrollbar-hide will-change-scroll
          ${shouldCenterItems ? 'justify-center' : 'justify-start'}
        `}
        onScroll={debouncedCheck}
      >
        <CategoryGrid
          categories={categories}
          isMobile={isMobile}
          onLocationNeeded={handleLocationNeeded}
        />
      </div>

      <ScrollIndicator
        scrollPosition={scrollPosition}
        isMobile={isMobile}
      />
    </div>
  );
}