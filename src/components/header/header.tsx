"use client";

import Link from "next/link";
import { Button, Input } from "@heroui/react";
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
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { SearchSuggestions } from "@/components/search-suggestions";
import { ProductBase } from "../../types/types";
import { motion } from "framer-motion";
import { XIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { CustomButton } from "@components/buttons/custom-button";

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

const Overlay = ({ onClick }: { onClick: () => void }) => {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
      onClick={onClick}
    />,
    document.body
  );
};

const MobileSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [suggestions, setSuggestions] = useState<ProductBase[]>([]);

  const fetchSuggestions = useDebouncedCallback(
    async (value: string) => {
      if (value.length < 3) return setSuggestions([]);

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

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return; // Solo activa si está abierto
    const handleScroll = () => {
      setIsOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      {isOpen && <Overlay onClick={() => setIsOpen(false)} />}

      <div className="relative z-50" ref={searchRef}>
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full flex flex-col justify-center items-center border border-default-600 bg-blue-50/50 dark:bg-gray-900/50"
          >
            <SearchIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        ) : (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "90%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ originY: 0 }}
            className="fixed top-[72px] left-0 mx-[5%] bg-blue-50 dark:bg-gray-900 shadow-lg rounded-2xl p-2 flex items-center border border-default-200"
          >
            <Input
              startContent={<SearchIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
              autoFocus
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                fetchSuggestions(e.target.value);
              }}
              onKeyDown={handleKeyPress}
              placeholder="Buscar..."
              className="w-full text-sm pl-1 pr-3 hover:border-transparent active:border-transparent"
            />
            <CustomButton onClick={(e) => {
              setIsOpen(false)
              e.stopPropagation();
            }}
              className="!p-2 !w-10 rounded-full bg-transparent hover:bg-gray-700">
              <XIcon />
            </CustomButton>
            {suggestions.length > 0 && (
              <SearchSuggestions
                suggestions={suggestions}
                onSelect={handleSearch}
              />
            )}
          </motion.div>
        )}
      </div>
    </>
  );
};

const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<ProductBase[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const fetchSuggestions = useDebouncedCallback(
    async (value: string) => {
      if (value.length < 3) return setSuggestions([]);

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
          inputWrapper: "bg-blue-50/30 dark:bg-gray-900/30 rounded-full border-2 border-default-400 hover:border-default-700 transition-all duration-300 hover:shadow-sm px-6",
          input: "text-md placeholder:text-default-600",
        }}
        labelPlacement="outside"
        placeholder="Buscar..."
        startContent={
          <SearchIcon className="text-base text-default-600 pointer-events-none flex-shrink-0" />
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
      className={`${className} z-50 top-0 left-0 right-0 h-16 backdrop-blur-3xl bg-gray-50/40 dark:bg-gray-900/40`}

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
              quality={50}
              src="/logonav.png"
              className="w-auto object-contain flex-shrink-0"
            />
          </Link>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent className="hidden md:flex sm:basis-full w-full gap-2" justify="center">
        <NavbarItem className="hidden md:flex flex-grow justify-center">
          <SearchInput />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="hidden xm:flex sm:basis-full w-full gap-2" justify="end">
        <NavbarItem className="flex gap-4 items-end">
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
        <NavbarItem>
          <MobileSearch />
        </NavbarItem>
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
