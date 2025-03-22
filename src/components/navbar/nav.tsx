"use client";

import React, { useMemo, useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { FaStore, FaShoppingCart, FaHome } from "react-icons/fa";
import { usePathname } from "next/navigation";
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
  const { isLowPerformance } = useDeviceOptimization();

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



  return (
    <div
      role="navigation"
      aria-label="Navegación principal"
      className={`
        bg-gray-50 dark:bg-gray-900 
        border-t border-divider 
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
          />
        ))}
      </Tabs>
    </div>
  );
};

export default Navbar;
