import { SearchSuggestions } from "@components/search-suggestions";
import { Button, Input } from "@heroui/react";
import { ProductBase } from "../../types/types";
import { motion } from "framer-motion";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export const SearchInput = ({ className }: { className?: string }) => {
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
    <div className={`${className} relative w-full max-w-xl`} ref={searchRef}>
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
          inputWrapper: "bg-white dark:bg-gray-800 rounded-xl px-6",
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
    </div>
  );
};