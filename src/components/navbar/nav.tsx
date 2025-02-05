"use client";

import { Tabs, Tab, Button } from "@heroui/react";
import { FaStore, FaShoppingCart, FaUser, FaHome } from "react-icons/fa";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useModal } from "@/contexts/modal-context";
import { useSession } from "next-auth/react";
import { FaList } from "react-icons/fa6";
import { CustomButton } from "@components/buttons/custom-button";

export const Navbar = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  const { openLogin } = useModal();
  const { data: session } = useSession();

  const getSelectedKey = (path: string) => {
    const validPaths = [
      "/",
      "/products",
      "/orders",
      "/settings",
      "/shopping-cart",
    ];

    return validPaths.includes(path) ? path : "/";
  };

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
          tab: "max-w-fit px-0 h-12",
          tabContent:
            "group-data-[selected=true]:text-[#06b6d4] dark:group-data-[selected=true]:text-[#22d3ee]",
        }}
        className="my-auto"
        color="primary"
        selectedKey={getSelectedKey(pathname)}
        variant="underlined"
        size="lg"
      >
        <Tab
          className="w-full"
          key="/"
          href="/"
          as={Link}
          title={
            <div className="flex flex-col items-center w-15 xxs:w-20">
              <FaHome />
              <span>Home</span>
            </div>
          }
        />
        <Tab
          className="w-full"
          key="/products"
          href="/products"
          as={Link}
          title={
            <div className="flex flex-col items-center w-15 xxs:w-20">
              <FaStore />
              <span>Store</span>
            </div>
          }
        />
        <Tab
          className="w-full"
          key="/shopping-cart"
          href="/shopping-cart"
          as={Link}
          title={
            <div className="flex flex-col items-center w-15 xxs:w-20">
              <FaShoppingCart />
              <div>
                <span className="mr-1">Cart</span>
              </div>
            </div>
          }
        />
        <Tab
          className="w-full"
          key="/orders"
          href="/orders"
          as={Link}
          title={
            <div className="flex flex-col items-center w-15 xxs:w-20">
              <FaList />
              <div>
                <span className="mr-1">Orders</span>
              </div>
            </div>
          }
        />
      </Tabs>
    </div>
  );
};
