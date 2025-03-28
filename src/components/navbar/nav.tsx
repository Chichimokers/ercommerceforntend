"use client";

import React, { useMemo } from "react";
import { Tabs, Tab } from "@heroui/react";
import { Store, ShoppingCart, Home, ListTodo } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export const Navbar = ({ className = "" }: { className?: string }) => {
  const pathname = usePathname();

  const navItems = useMemo(() => [
    { key: "/", href: "/", icon: Home, label: "Inicio" },
    { key: "/products", href: "/products", icon: Store, label: "Tienda" },
    { key: "/shopping-cart", href: "/shopping-cart", icon: ShoppingCart, label: "Carrito" },
    { key: "/orders", href: "/orders", icon: ListTodo, label: "Pedidos" }
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
    >
      <Tabs
        aria-label="Opciones de navegación"
        classNames={{
          tabList:
            "gap-1 w-full relative rounded-none p-0 flex justify-around items-center",
          cursor:
            `w-14 transition-all bg-[#22d3ee] dark:bg-[#06b6d4]`,
          tab: "max-w-fit px-0 h-12 w-full",
          tabContent:
            "group-data-[selected=true]:text-[#06b6d4] dark:group-data-[selected=true]:text-[#22d3ee]",
        }}
        className="my-auto"
        color="primary"
        selectedKey={selectedKey}
        variant="underlined"
        size="lg"
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
