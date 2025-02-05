"use client";

import Link from "next/link";
import { Input } from "@heroui/react";
import {
  Navbar as HerouiNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import { Spacer } from "@heroui/react";
import Image from "next/image";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon } from "@/components/icons";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoginButton } from "../buttons/login-button";
import dynamic from "next/dynamic";

const IconButton = dynamic(() => import("@/components/buttons/cart-button"));
const AccountButton = dynamic(
  () => import("@/components/buttons/account-button")
);
const DrawerCart = dynamic(() => import("@/components/drawers/drawer-cart"));

const SearchInput = () => (
  <Input
    aria-label="Search"
    variant="faded"
    classNames={{
      inputWrapper:
        "bg-white dark:bg-black bg-opacity-50 dark:bg-opacity-50 rounded-full border-2 border-default-200 hover:border-default-400 transition-all min-w-32",
      input: "text-sm",
    }}
    labelPlacement="outside"
    placeholder="Buscar..."
    startContent={
      <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
    }
    type="search"
  />
);

export const Header = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  const isCartPage = pathname === "/shopping-cart";
  const { data: session } = useSession();

  return (
    <HerouiNavbar
      maxWidth="full"
      className={`${className} z-50 top-0 left-0 right-0 h-16`}
    >
      <NavbarContent className="sm:basis-full" justify="start">
        <NavbarBrand className="gap-1 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <Image
              priority
              alt="Company Logo"
              height={60}
              loading="eager"
              src="/logonav.png"
              width={140}
              className="h-15 w-36 object-contain"
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden xm:flex sm:basis-full w-full gap-2"
        justify="end"
      >
        <NavbarItem className="hidden xm:flex">
          <SearchInput />
        </NavbarItem>
        <NavbarItem className="hidden xm:flex">
          <ThemeSwitch />
          <Spacer x={2} y={0} />
          {!isCartPage && (
            <>
              <DrawerCart />
              <Spacer x={2} y={0} />
            </>
          )}

          {session ? <AccountButton /> : <LoginButton />}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="xm:hidden basis" justify="end">
        <ThemeSwitch />
        {!isCartPage && (
          <div className="hidden xm:flex">
            <IconButton />
          </div>
        )}
        {session ? <AccountButton /> : <LoginButton />}
      </NavbarContent>
    </HerouiNavbar>
  );
};
