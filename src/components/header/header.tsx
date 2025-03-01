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

  // Debounce para sugerencias
  const fetchSuggestions = useDebouncedCallback(async (value: string) => {
    if (value.length > 2) {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}public/search`;

        const response = await fetch(url, {
          method: 'POST', // Cambiado a POST
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: value }), // Corregido (elimina el objeto anidado)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Resultados obtenidos:', data);
        setSuggestions(data);
      } catch (error) {
        console.error('Error completo:', error);
        setSuggestions([]);
      }
    }
  }, 300);

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
          inputWrapper: "bg-white dark:bg-black bg-opacity-50 dark:bg-opacity-50 rounded-full border-2 border-default-200 hover:border-default-400 transition-all duration-300 shadow-sm hover:shadow-md px-6",
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
  const isCartPage = pathname === "/shopping-cart";
  const { data: session, status } = useSession();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Evitar renderizado hasta tener el estado de sesión definido
  if (status === "loading") return null;

  return (
    <HerouiNavbar
      maxWidth="full"
      className={`${className} z-40 top-0 left-0 right-0 h-16 backdrop-blur-sm bg-white/80 dark:bg-black/80`}
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

      <NavbarContent
        className="hidden xm:flex sm:basis-full w-full gap-4"
        justify="end"
      >
        <NavbarItem className="hidden md:flex flex-1 justify-center">
          <SearchInput />
        </NavbarItem>
        <NavbarItem className="hidden xm:flex gap-4 items-center">
          <ThemeSwitch />
          {!isCartPage && (
            <>
              <DrawerCart
                className="hover:animate-pulse"
                aria-label="Abrir carrito"
              />
            </>
          )}
          {session ? <AccountButton /> : !isAuthPage && <LoginButton />}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="xm:hidden basis" justify="end">
        <ThemeSwitch />
        {!isCartPage && (
          <div className="hidden xm:flex">
            <IconButton className="hover:animate-bounce" />
          </div>
        )}
        {session ? <AccountButton /> : <LoginButton />}
      </NavbarContent>
    </HerouiNavbar>
  );
};
