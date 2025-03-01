"use client";

import { Tabs, Tab } from "@heroui/react";
import { FaStore, FaShoppingCart, FaUser, FaHome } from "react-icons/fa";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaList } from "react-icons/fa6";

export const Navbar = ({ className }: { className?: string }) => {
  const pathname = usePathname();

  const navItems = [
    { key: "/", href: "/", icon: FaHome, label: "Home" },
    { key: "/products", href: "/products", icon: FaStore, label: "Store" },
    { key: "/shopping-cart", href: "/shopping-cart", icon: FaShoppingCart, label: "Cart" },
    { key: "/orders", href: "/orders", icon: FaList, label: "Orders" }
  ];

  const selectedKey = navItems.some(item => item.key === pathname) ? pathname : "/";

  return (
    <div
      className={`bg-white/85 dark:bg-black/85 backdrop-blur-lg border-t border-divider h-16 flex w-full px-4 flex-col z-50 ${className}`}
    >
      <Tabs
        aria-label="Options"
        classNames={{
          tabList:
            "gap-1 w-full relative rounded-none p-0 flex justify-around items-center",
          cursor: "w-14 bg-[#22d3ee] dark:bg-[#06b6d4]",
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
            onMouseEnter={() => {
              if (href === "/products") {
                // Precarga los datos de productos
                const queryParams = new URLSearchParams({
                  page: "1",
                  // Parámetros iniciales
                }).toString();
                fetch(`${process.env.NEXT_PUBLIC_API_URL}public/products?${queryParams}`);
              }
            }}
            title={
              <div className="flex flex-col items-center w-15 xxs:w-20">
                <Icon />
                <span>{label}</span>
              </div>
            }
          />
        ))}
      </Tabs>
    </div>
  );
};
