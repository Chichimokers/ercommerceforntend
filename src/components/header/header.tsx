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
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { SearchSuggestions } from "@/components/search-suggestions";
import { ProductBase } from "../../types/types";
import { motion, AnimatePresence } from "framer-motion";
import { XIcon } from "lucide-react";
import { CustomButton } from "@components/buttons/custom-button";
import { Overlay } from "@components/overlay";
import { LocationButton } from "@components/buttons/location-button";

const AccountButton = dynamic(
  () => import("@/components/buttons/account-button"), {
  loading: () => (
    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
  )
});

const DrawerCart = dynamic(() => import("@/components/drawers/drawer-cart"), {
  loading: () => (
    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
  )
});

/**
 * Búsqueda para dispositivos móviles con animación
 */
const MobileSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [suggestions, setSuggestions] = useState<ProductBase[]>([]);

  // Función debounced para buscar sugerencias
  const fetchSuggestions = useDebouncedCallback(
    async (value: string) => {
      if (value.length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}public/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: value }),
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error de búsqueda:", error);
        setSuggestions([]);
      }
    },
    300
  );

  // Cerrar búsqueda al hacer click fuera
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

  // Cerrar búsqueda al hacer scroll
  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = () => setIsOpen(false);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  // Focus en input al abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Manejar búsqueda
  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsOpen(false);
      setSearchTerm("");
    }
  }, [router, searchTerm]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectSuggestion = (term: string) => {
    setSearchTerm(term);
    router.push(`/search?q=${encodeURIComponent(term.trim())}`);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && <Overlay onClick={() => setIsOpen(false)} />}

      <div className="relative z-50" ref={searchRef}>
        <AnimatePresence>
          {!isOpen ? (
            <motion.button
              key="search-button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="w-10 h-10 bg-blue-50/80 dark:bg-gray-800/80 rounded-full flex flex-col justify-center items-center border border-blue-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
              aria-label="Abrir búsqueda"
            >
              <SearchIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </motion.button>
          ) : (
            <motion.div
              key="search-container"
              initial={{ width: 0, opacity: 0, y: -20 }}
              animate={{ width: "90%", opacity: 1, y: 0 }}
              exit={{ width: 0, opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-[72px] left-0 mx-[5%] bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-2 border border-blue-100 dark:border-gray-700 flex items-center backdrop-blur-sm"
            >
              <Input
                ref={inputRef}
                startContent={<SearchIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
                onKeyDown={handleKeyPress}
                placeholder="Buscar productos..."
                classNames={{
                  input: "text-sm",
                  inputWrapper: "bg-transparent border-none shadow-none focus:shadow-none",
                }}
                aria-label="Buscar productos"
              />
              <CustomButton
                onClick={() => setIsOpen(false)}
                className="!p-2 !w-10 rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </CustomButton>

              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-full mt-1 z-50"
                  >
                    <SearchSuggestions
                      suggestions={suggestions}
                      onSelect={handleSelectSuggestion}
                      searchTerm={searchTerm} // Añade esta línea
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

/**
 * Componente de búsqueda para pantallas grandes
 */
const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<ProductBase[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useDebouncedCallback(
    async (value: string) => {
      if (value.length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}public/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: value }),
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error de búsqueda:", error);
        setSuggestions([]);
      }
    },
    300
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSuggestions([]);
      setIsFocused(false);
    }
  }, [router, searchTerm]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectSuggestion = (term: string) => {
    setSearchTerm(term);
    router.push(`/search?q=${encodeURIComponent(term.trim())}`);
    setIsFocused(false);
  };

  return (
    <div className="relative w-full max-w-xl" ref={searchRef}>
      <motion.div
        initial={false}
        animate={{
          scale: isFocused ? 1.02 : 1,
          boxShadow: isFocused ? "0 8px 16px rgba(0,0,0,0.1)" : "0 2px 4px rgba(0,0,0,0.05)"
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="rounded-full border-2 border-blue-100 dark:border-gray-700 overflow-hidden"
      >
        <Input
          aria-label="Buscar productos"
          variant="faded"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          onKeyDown={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          classNames={{
            inputWrapper: "bg-white dark:bg-gray-800 rounded-full px-6",
            input: "text-md placeholder:text-gray-500",
          }}
          labelPlacement="outside"
          placeholder="Buscar productos..."
          startContent={
            <SearchIcon className="text-base text-blue-600 dark:text-blue-400 pointer-events-none flex-shrink-0" />
          }
          endContent={
            searchTerm && (
              <Button
                isIconOnly
                variant="light"
                aria-label="Limpiar búsqueda"
                className="rounded-full p-0"
                onClick={() => setSearchTerm("")}
              >
                <XIcon className="w-4 h-4 text-gray-500" />
              </Button>
            )
          }
          type="search"
        />
      </motion.div>

      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute top-full left-0 w-full mt-2 z-50"
          >
            <SearchSuggestions
              suggestions={suggestions}
              onSelect={handleSelectSuggestion}
              searchTerm={searchTerm} // Añade esta línea
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Componente principal del Header
 */
export const Header = ({ className, setModalOpen }: { className?: string, setModalOpen: Dispatch<SetStateAction<boolean>> }) => {
  const pathname = usePathname();
  const isCartOrBuyPage = pathname === "/shopping-cart" || pathname === "/buy";
  const { data: session, status } = useSession({ required: false });
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const router = useRouter();

  // Efecto sutil de scroll para el header
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <HerouiNavbar
        maxWidth="full"
        isBlurred
        className={`${className} z-50 top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 transition-all duration-300 ${scrolled ? "shadow-md border-b border-gray-100 dark:border-gray-800" : "shadow-sm"
          }`}
      >
        {/* Logo y Marca */}
        <NavbarContent className="flex-shrink-0 sm:flex-1 md:flex-initial" justify="start">
          <NavbarBrand className="gap-2">
            <Link
              className="flex items-center gap-2 transition-transform duration-200 hover:scale-105"
              color="foreground"
              href="/"
            >
              <Image
                alt="EsAki Logo"
                width={160}
                height={60}
                quality={75}
                src="/logonav.png"
                className="w-auto h-9 md:h-8 lg:h-9 object-contain flex-shrink-0"
                priority
              />
            </Link>
          </NavbarBrand>
        </NavbarContent>

        {/* Búsqueda en pantallas medianas y grandes */}
        <NavbarContent className="hidden md:flex flex-1 gap-2" justify="center">
          <NavbarItem className="w-full max-w-xl">
            <SearchInput />
          </NavbarItem>
        </NavbarContent>

        {/* Botones de acción en pantallas medianas y grandes */}
        <NavbarContent className="hidden xm:flex sm:basis-full w-full gap-2" justify="end">
          <NavbarItem className="flex gap-3 items-end">
            <LocationButton setModalOpen={setModalOpen} />

            <div className="h-10 border-r border-gray-200 dark:border-gray-800 mx-1"></div>

            <ThemeSwitch />

            {!isCartOrBuyPage && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <DrawerCart />
              </motion.div>
            )}

            {status === "loading" ? (
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            ) : session ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AccountButton />
              </motion.div>
            ) : (
              !isAuthPage && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LoginButton />
                </motion.div>
              )
            )}
          </NavbarItem>
        </NavbarContent>

        {/* Botones de acción en móviles */}
        <NavbarContent className="xm:hidden basis" justify="end">
          <NavbarItem className="flex gap-2.5 items-end">
            <MobileSearch />
            <LocationButton setModalOpen={setModalOpen} />
            <ThemeSwitch />

            {status === "loading" ? (
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            ) : session ? (
              <AccountButton />
            ) : (
              !isAuthPage && <LoginButton />
            )}
          </NavbarItem>
        </NavbarContent>
      </HerouiNavbar>
    </motion.div>
  );
};
