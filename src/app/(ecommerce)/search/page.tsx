"use client";

import { useEffect, useState, useCallback, useContext, Suspense } from "react";
import ProductCard from "@components/cards/product-card";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductBase } from "../../../types/types";
import { Search, Filter, X, ArrowUpDown, Grid, List, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button, Chip, Checkbox, Pagination, Select, SelectItem, CheckboxGroup } from "@heroui/react";
import { formatCurrency } from "@components/format-currency";
import { UUID } from "crypto";
import { useLocationStore } from "@store/location/location-store";
import { useCurrencyStore } from "@store/currency/currency-store";

type SearchProducts = {
  id: UUID,
  name: string,
  image: string,
  price: number,
  short_description: string,
  category: {
    name: string
  },
}

// Opciones de ordenamiento
const sortOptions = [
  { value: "relevance", label: "Relevancia" },
  { value: "price_asc", label: "Precio: Menor a Mayor" },
  { value: "price_desc", label: "Precio: Mayor a Menor" },
  { value: "name_asc", label: "Nombre A-Z" },
  { value: "name_desc", label: "Nombre Z-A" }
];

// Rango de precios para filtrar
const priceRanges = [
  { id: "0-10", label: "Menos de $10", min: 0, max: 10 },
  { id: "10-25", label: "$10 - $25", min: 10, max: 25 },
  { id: "25-50", label: "$25 - $50", min: 25, max: 50 },
  { id: "50-100", label: "$50 - $100", min: 50, max: 100 },
  { id: "100-1000", label: "Más de $100", min: 100, max: 1000 }
];

// Función auxiliar para extraer nombres de categorías de forma segura
const getCategoryName = (category: any): string => {
  if (!category) return 'Sin categoría';

  if (typeof category === 'string') {
    // Intentar parsear si parece JSON
    if (category.startsWith('{')) {
      try {
        const parsed = JSON.parse(category);
        return parsed.name || 'Categoría';
      } catch {
        return category;
      }
    }
    return category;
  }

  // Es un objeto
  if (typeof category === 'object') {
    return category.name || 'Categoría';
  }

  // Fallback para otros tipos
  return String(category);
};

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchLoadingFallback() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg w-32"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto md:px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
                <div className="h-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-1/2" />
                <div className="mt-3 flex justify-between items-center">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-1/3" />
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchPageContent() {
  const [results, setResults] = useState<ProductBase[]>([]);
  const [filteredResults, setFilteredResults] = useState<ProductBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [page, setPage] = useState(1);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchError, setSearchError] = useState(false);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [relatedSearches, setRelatedSearches] = useState<string[]>([]);
  const { rateExchange } = useCurrencyStore();
  const { location } = useLocationStore();

  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");

  const resultsPerPage = 15;

  useEffect(() => {
    if (query) {
      setLoading(true);
      setSearchError(false);

      fetch(`${process.env.NEXT_PUBLIC_API_URL}public/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: query, province: location.province }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Error al buscar productos");
          return res.json();
        })
        .then((data) => {
          setResults(data);
          setFilteredResults(data);
          setLoading(false);

          const uniqueCategoryMap = new Map();

          data.forEach((item: SearchProducts) => {
            if (item.category) {
              let categoryId;
              let categoryName;

              if (typeof item.category === 'object' && item.category !== null) {
                categoryId = JSON.stringify(item.category);
                categoryName = item.category.name || 'Categoría';
              }
              else {
                categoryId = String(item.category);
                categoryName = String(item.category);
              }

              uniqueCategoryMap.set(categoryId, {
                id: categoryId,
                name: categoryName
              });
            }
          });

          // Convertir Map a array para state
          const uniqueCategories = Array.from(uniqueCategoryMap.values());
          setCategories(uniqueCategories);

          // Resto del código para búsquedas relacionadas...
          if (query.length > 3) {
            const searchTerms = query.split(" ").filter(term => term.length > 3);
            if (searchTerms.length > 0) {
              const related = [
                `${searchTerms[0]} premium`,
                `${searchTerms[0]} ofertas`,
                `mejores ${searchTerms[0]}`,
                `${searchTerms[0]} nuevos`
              ];
              setRelatedSearches(related);
            }
          }
        })
        .catch((error) => {
          console.error("Error de búsqueda:", error);
          setLoading(false);
          setSearchError(true);
        });
    }
  }, [query]);

  // Aplicar filtros y ordenamiento
  useEffect(() => {
    if (results.length === 0) return;

    let filtered = [...results];

    // Filtrar por categoría
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.category) return false;

        // Para cada categoría seleccionada, comprobar si coincide con el producto
        return selectedCategories.some(selectedCat => {
          // Si la categoría del producto es un objeto, convertirla a string para comparar
          const productCatStr = typeof product.category === 'object'
            ? JSON.stringify(product.category)
            : String(product.category);

          return productCatStr === selectedCat;
        });
      });
    }

    // Filtrar por precio
    if (selectedPriceRanges.length > 0) {
      filtered = filtered.filter(product => {
        return selectedPriceRanges.some(range => {
          const [min, max] = range.split("-").map(Number);
          return product.price >= min && product.price <= max;
        });
      });
    }

    // Ordenar resultados
    switch (sortBy) {
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name_asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Ya está ordenado por relevancia
        break;
    }

    setFilteredResults(filtered);
    setPage(1); // Volver a la primera página cuando cambian los filtros
  }, [results, selectedCategories, selectedPriceRanges, sortBy]);

  // Manejar cambios en filtros de precio
  const handlePriceRangeChange = useCallback((rangeId: string) => {
    setSelectedPriceRanges(prev => {
      if (prev.includes(rangeId)) {
        return prev.filter(id => id !== rangeId);
      } else {
        return [...prev, rangeId];
      }
    });
  }, []);

  // Manejar cambios en filtros de categoría
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  }, []);

  // Resetear filtros
  const resetFilters = () => {
    setSelectedPriceRanges([]);
    setSelectedCategories([]);
    setSortBy("relevance");
  };

  // Calcular productos paginados
  const paginatedResults = filteredResults.slice(
    (page - 1) * resultsPerPage,
    page * resultsPerPage
  );

  // Total de páginas
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / resultsPerPage));

  // Navegar a una búsqueda relacionada
  const searchRelated = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div
      className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900"
    >
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <nav className="flex mb-4 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Inicio
            </Link>
            <span className="mx-2">›</span>
            <span className="text-gray-800 dark:text-gray-200">Resultados de búsqueda</span>
          </nav>

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Search className="inline-block w-6 h-6 text-blue-600 dark:text-blue-400" />
                Resultados para "{query}"
              </h1>

              <div className="mt-2 text-gray-600 dark:text-gray-300">
                {!loading && (
                  filteredResults.length === results.length ? (
                    <p>{filteredResults.length} productos encontrados</p>
                  ) : (
                    <p>{filteredResults.length} de {results.length} productos</p>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "solid" : "bordered"}
                  color={viewMode === "grid" ? "primary" : "default"}
                  isIconOnly
                  aria-label="Vista de cuadrícula"
                  onClick={() => setViewMode("grid")}
                  className="rounded-md"
                >
                  <Grid size={18} />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "solid" : "bordered"}
                  color={viewMode === "list" ? "primary" : "default"}
                  isIconOnly
                  aria-label="Vista de lista"
                  onClick={() => setViewMode("list")}
                  className="rounded-md"
                >
                  <List size={18} />
                </Button>
              </div>

              <Select
                size="sm"
                selectedKeys={[sortBy]}
                onChange={(e) => setSortBy(e.target.value)}
                startContent={<ArrowUpDown size={16} />}
                className="w-36 sm:w-44"
                variant="bordered"
              >
                {sortOptions.map((option) => (
                  <SelectItem key={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>

              <Button
                size="sm"
                variant={showFilters ? "solid" : "bordered"}
                color={showFilters ? "primary" : "default"}
                onClick={() => setShowFilters(!showFilters)}
                startContent={<Filter size={16} />}
                className="rounded-md md:hidden"
              >
                Filtros
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2">
        <div className="flex flex-col md:flex-row gap-2">
          <aside
            className={`md:block md:w-64 shrink-0 ${showFilters ? 'block' : 'hidden'}`}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h2>
                {(selectedCategories.length > 0 || selectedPriceRanges.length > 0) && (
                  <Button
                    size="sm"
                    color="default"
                    variant="light"
                    onClick={resetFilters}
                  >
                    Limpiar
                  </Button>
                )}
              </div>

              {/* Filtros aplicados - Corregidos */}
              {(selectedCategories.length > 0 || selectedPriceRanges.length > 0) && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Filtros aplicados:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((cat, index) => {
                      // Encontrar la categoría en la lista para mostrar su nombre
                      const categoryObj = categories.find(c => c.id === cat);
                      // Obtener nombre para mostrar
                      const displayName = categoryObj ? getCategoryName(categoryObj.name) : 'Categoría';

                      return (
                        <Chip
                          key={`chip-${index}`}
                          color="primary"
                          variant="flat"
                          size="sm"
                          onClose={() => handleCategoryChange(cat)}
                        >
                          {displayName}
                        </Chip>
                      );
                    })}

                    {selectedPriceRanges.map(range => {
                      const rangeInfo = priceRanges.find(r => r.id === range);
                      return (
                        <Chip
                          key={range || `range-${Math.random()}`}
                          color="primary"
                          variant="flat"
                          size="sm"
                          onClose={() => handlePriceRangeChange(range)}
                        >
                          {rangeInfo?.label || range}
                        </Chip>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filtro por categoría - Corregido */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Categorías</h3>
                {categories.length > 0 ? (
                  <div className="space-y-2 pr-2">
                    {categories.map((category, index) => {
                      // ID seguro para React
                      const safeId = `cat-${index}`;

                      // Obtener el nombre para mostrar
                      const displayName = getCategoryName(category.name);

                      return (
                        <div key={safeId} className="flex items-center">
                          <Checkbox
                            id={safeId}
                            isSelected={selectedCategories.includes(category.id)}
                            onChange={() => handleCategoryChange(category.id)}
                            size="md"
                            color="primary"
                          />
                          <label
                            htmlFor={safeId}
                            className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                          >
                            {displayName}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No hay categorías disponibles
                  </p>
                )}
              </div>

              {/* Filtro por precio */}
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Precio</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <div key={range.id} className="flex items-center">
                      <Checkbox
                        isSelected={selectedPriceRanges.includes(range.id)}
                        onChange={() => handlePriceRangeChange(range.id)}
                        size="md"
                        color="primary"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                        {range.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Búsquedas relacionadas (móvil) */}
              {relatedSearches.length > 0 && (
                <div className="mt-6 md:hidden">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                    Búsquedas relacionadas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => searchRelated(term)}
                        className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          <div
            className="flex-1"
          >
            {loading ? (
              <div className={viewMode === "grid" ?
                "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" :
                "flex flex-col gap-4"
              }>
                {[...Array(8)].map((_, i) => (
                  viewMode === "grid" ? (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
                      <div className="h-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg mb-3" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-1/2" />
                      <div className="mt-3 flex justify-between items-center">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-1/3" />
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex gap-4">
                      <div className="h-24 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-1/2 mb-2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-full mb-3" />
                        <div className="flex justify-between items-center">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-1/3" />
                          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : searchError ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center">
                <div className="mx-auto mb-6 text-red-400 dark:text-red-300">
                  <X className="w-16 h-16 mx-auto" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Error al realizar la búsqueda
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Lo sentimos, ha ocurrido un error al buscar "{query}". Por favor, inténtalo de nuevo.
                </p>
                <Button
                  color="primary"
                  onClick={() => window.location.reload()}
                  className="mx-auto"
                >
                  Intentar de nuevo
                </Button>
              </div>
            ) : filteredResults.length > 0 ? (
              // Resultados encontrados
              <>
                <div className={viewMode === "grid" ?
                  "grid grid-cols-2 xm:grid-cols-3 md:grid-cols-2 xg:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2" :
                  "flex flex-col gap-4"
                }>
                  {paginatedResults.map((product) => (
                    viewMode === "grid" ? (
                      <ProductCard
                        key={product.id}
                        product={product}
                        prefetch="viewport"
                        imgClassName="group-hover:scale-105 transition-all duration-300"
                      />
                    ) : (
                      <Link
                        href={`/products/${product.id}`}
                        key={product.id}
                        className="group bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700 flex gap-4 hover:shadow-md transition-all duration-300"
                      >
                        <div className="relative h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={product.image || "/placeholder-product.jpg"}
                            alt={product.name}
                            fill
                            sizes="96px"
                            className="object-cover group-hover:scale-110 transition-all duration-300"
                          />
                          {product.quantity === 0 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white text-xs font-medium px-2 py-1 bg-red-500/80 rounded">
                                Agotado
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                            {product.short_description || "Sin descripción disponible"}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                              {formatCurrency((product.price * (rateExchange?.exchangeRate || 1)), rateExchange?.currency, rateExchange?.symbol)}
                            </span>
                            <Button
                              size="sm"
                              color="primary"
                              variant="light"
                              className="min-w-0 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30"
                            >
                              Ver producto
                            </Button>
                          </div>
                        </div>
                      </Link>
                    )
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      total={totalPages}
                      initialPage={page}
                      onChange={setPage}
                      showControls
                      color="primary"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm text-center">
                <div className="mx-auto mb-6 text-gray-400 dark:text-gray-500">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  No encontramos resultados para "{query}"
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                  Intenta con diferentes términos de búsqueda o revisa los filtros aplicados.
                </p>

                {relatedSearches.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                      ¿Quizás te interese buscar?
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      {relatedSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => searchRelated(term)}
                          className="text-sm px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  color="primary"
                  variant="bordered"
                  onClick={() => router.push("/products")}
                  className="mt-6"
                >
                  Ver todos los productos
                </Button>
              </div>
            )}

            {filteredResults.length > 0 && relatedSearches.length > 0 && (
              <div className="mt-8 hidden md:block">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  Búsquedas relacionadas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {relatedSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => searchRelated(term)}
                      className="text-sm px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
