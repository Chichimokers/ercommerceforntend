"use client";

import React, { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { FaStore, FaShoppingCart, FaUser, FaHome } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FaList } from "react-icons/fa6";
import { useIsomorphicLayoutEffect } from "framer-motion";

const useDeviceOptimization = () => {
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const isLowEnd =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 768;

    // Detectar conexiones lentas
    const hasLowBandwidth =
      'connection' in navigator &&
      // @ts-ignore - Connection API no está completamente tipada
      (navigator.connection?.saveData || ['slow-2g', '2g', '3g'].includes(navigator.connection?.effectiveType));

    setIsLowPerformance(prefersReducedMotion || hasLowBandwidth || isLowEnd);
  }, []);

  return { isLowPerformance, isTouchDevice };
};

export const Navbar = ({ className = "" }: { className?: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLowPerformance, isTouchDevice } = useDeviceOptimization();
  const prefetchedRef = useRef<Record<string, boolean>>({});

  const navItems = useMemo(() => [
    { key: "/", href: "/", icon: FaHome, label: "Inicio" },
    { key: "/products", href: "/products", icon: FaStore, label: "Tienda" },
    { key: "/shopping-cart", href: "/shopping-cart", icon: FaShoppingCart, label: "Carrito" },
    { key: "/orders", href: "/orders", icon: FaList, label: "Pedidos" }
  ], []);

  const selectedKey = useMemo(() => {
    const exact = navItems.find(item => item.key === pathname)?.key;
    if (exact) return exact;

    return navItems.find(item =>
      item.key !== "/" && pathname.startsWith(item.key)
    )?.key || "/";
  }, [pathname, navItems]);

  const handlePrefetch = useCallback((href: string) => {
    if (isLowPerformance || prefetchedRef.current[href]) return;

    if (href === "/products" && !prefetchedRef.current[href]) {
      router.prefetch("/products");

      const prefetchData = async () => {
        try {
          const queryParams = new URLSearchParams({
            page: "1",
            limit: "10",
          }).toString();

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}public/products?${queryParams}`,
            {
              signal: controller.signal,
              priority: 'low',
              cache: 'force-cache'
            }
          );

          clearTimeout(timeoutId);
          if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem('prefetched_products', JSON.stringify(data));
          }
        } catch (error: unknown) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.debug('Error prefetching products data:', error);
          }
        }
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => prefetchData());
      } else {
        setTimeout(prefetchData, 1000);
      }

      prefetchedRef.current[href] = true;
    }
  }, [router, isLowPerformance]);

  const getInteractionHandlers = useCallback((href: string) => {
    if (isLowPerformance) return {};

    return isTouchDevice
      ? {}
      : {
        onMouseEnter: () => handlePrefetch(href),
        onFocus: () => handlePrefetch(href)
      };
  }, [handlePrefetch, isTouchDevice, isLowPerformance]);

  return (
    <div
      role="navigation"
      aria-label="Navegación principal"
      className={`
        bg-gray-50/85 dark:bg-gray-900/85 
        backdrop-blur-lg border-t border-divider 
        h-16 flex w-full px-4 flex-col z-50
        ${className}
      `}
      style={{
        contain: 'layout paint',
        willChange: 'transform',
      }}
    >
      <Tabs
        aria-label="Opciones de navegación"
        classNames={{
          tabList:
            "gap-1 w-full relative rounded-none p-0 flex justify-around items-center",
          cursor:
            `w-14 transition-all ${isLowPerformance
              ? ""
              : "motion-safe:transition-transform motion-safe:duration-300"
            } bg-[#22d3ee] dark:bg-[#06b6d4]`,
          tab: "max-w-fit px-0 h-12 w-full",
          tabContent:
            "group-data-[selected=true]:text-[#06b6d4] dark:group-data-[selected=true]:text-[#22d3ee]",
        }}
        className="my-auto"
        color="primary"
        selectedKey={selectedKey}
        variant="underlined"
        size="lg"
        disableAnimation={isLowPerformance}
      >
        {navItems.map(({ key, href, icon: Icon, label }) => (
          <Tab
            key={key}
            href={href}
            as={Link}
            className="w-full"
            title={
              <div
                className="flex flex-col items-center w-15 xxs:w-20"
                aria-label={label}
              >
                <Icon aria-hidden="true" />
                <span className="text-xs sm:text-sm">{label}</span>
              </div>
            }
            {...getInteractionHandlers(href)}
          />
        ))}
      </Tabs>
    </div>
  );
};

export default Navbar;
