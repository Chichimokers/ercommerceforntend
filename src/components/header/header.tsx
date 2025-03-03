"use client";

import Link from "next/link";
import { Input } from "@heroui/react";
import {
  Navbar as HerouiNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import Image from "next/image";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon } from "@/components/icons";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoginButton } from "../buttons/login-button";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { SearchSuggestions } from "@/components/search-suggestions";
import { ProductBase } from "../../types/types";

const IconButton = dynamic(() => import("@/components/buttons/cart-button"), {
  loading: () => (
    <div className="w-10 h-10 bg-default-200 rounded-full animate-pulse" />
  )
});

const AccountButton = dynamic(
  () => import("@/components/buttons/account-button"), {
  loading: () => (
    <div className="w-10 h-10 bg-default-200 rounded-full animate-pulse" />
  )
}
);
const DrawerCart = dynamic(() => import("@/components/drawers/drawer-cart"), {
  loading: () => (
    <div className="w-10 h-10 bg-default-200 rounded-full animate-pulse" />
  )
});

const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<ProductBase[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const fetchSuggestions = useDebouncedCallback(
    async (value: string) => {
      if (value.length < 3) return setSuggestions([]); // Evita llamadas innecesarias

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}public/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: value }),
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);
        setSuggestions(await response.json());
      } catch (error) {
        console.error("Error de búsqueda:", error);
        setSuggestions([]);
      }
    },
    300
  );


  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSuggestions([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative w-full max-w-xl">
      <Input
        aria-label="Search"
        variant="faded"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          fetchSuggestions(e.target.value);
        }}
        onKeyDown={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        classNames={{
          inputWrapper: "bg-opacity-50 dark:bg-opacity-50 rounded-full border-2 border-default-200 hover:border-default-400 transition-all duration-300 hover:shadow-sm px-6",
          input: "text-md placeholder:text-gray-400 dark:placeholder:text-gray-500",
        }}
        labelPlacement="outside"
        placeholder="Buscar..."
        startContent={
          <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
        }
        type="search"
      />

      {isFocused && suggestions.length > 0 && (
        <SearchSuggestions
          suggestions={suggestions}
          onSelect={handleSearch}
        />
      )}
    </div>
  );
};

export const Header = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  const isCartOrBuyPage = pathname === "/shopping-cart" || pathname === "/buy";
  const { data: session, status } = useSession({ required: false });
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <HerouiNavbar
      maxWidth="full"
      className={`${className} z-50 top-0 left-0 right-0 h-16 backdrop-blur-lg bg-gray-50/85 dark:bg-gray-900/20`}
    >
      <NavbarContent className="sm:basis-full max-w-fit" justify="start">
        <NavbarBrand className="gap-3 max-w-none">
          <Link
            className="flex items-center gap-2 w-[160] h-[60]"
            color="foreground"
            href="/"
          >
            <Image
              alt="Company Logo"
              loading="lazy"
              width={160}
              height={60}
              src="/logonav.png"
              className="w-auto object-contain flex-shrink-0"
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden xm:flex sm:basis-full w-full gap-4" justify="end">
        <NavbarItem className="hidden md:flex flex-1 justify-center">
          <SearchInput />
        </NavbarItem>
        <NavbarItem className="flex gap-4 items-center">
          <ThemeSwitch />
          {!isCartOrBuyPage && <DrawerCart />}
          {status === "loading" ? (
            <div className="w-10 h-10 bg-default-200 rounded-full animate-pulse" />
          ) : session ? (
            <AccountButton />
          ) : (
            !isAuthPage && <LoginButton />
          )}
        </NavbarItem>
      </NavbarContent>


      <NavbarContent className="xm:hidden basis" justify="end">
        <ThemeSwitch />
        {!isCartOrBuyPage && (
          <div className="hidden xm:flex">
            <IconButton />
          </div>
        )}
        {status === "loading" ? (
          <div className="w-10 h-10 bg-default-200 rounded-full animate-pulse" />
        ) : session ? (
          <AccountButton />
        ) : (
          !isAuthPage && <LoginButton />
        )}
      </NavbarContent>
    </HerouiNavbar>
  );
};
