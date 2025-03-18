import { useEffect, useState, useCallback, useMemo, Dispatch, SetStateAction, memo } from "react";
import { Slider, Select, SelectItem, CheckboxGroup, Checkbox, Button } from "@heroui/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProductContext } from "@/contexts/product-context";
import { ratingOptions } from "./relation";
import { FilterState } from "@/types/types";

interface FiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  setIsInvalidFilters: Dispatch<SetStateAction<boolean>>;
  className?: string;
  onPendingFiltersChange?: (pendingFilters: FilterStateType | null) => void;
}

interface FilterStateType {
  categories: {
    ids: string[];
    names: string[];
  };
  subcategories: {
    ids: string[];
    names: string[];
  };
  ratingIndex: number;
  priceRange: [number, number];
}

const ALL_CATEGORIES = "Todos";
const DEFAULT_PRICE_RANGE: [number, number] = [0, 1000];

const DEFAULT_FILTER_STATE: FilterStateType = {
  categories: {
    ids: [],
    names: [ALL_CATEGORIES],
  },
  subcategories: {
    ids: [],
    names: [],
  },
  ratingIndex: 0,
  priceRange: DEFAULT_PRICE_RANGE,
};

// Componente de categoría memoizado para reducir renderizados
const CategoryCheckbox = memo(({ category }: { category: string }) => (
  <Checkbox key={category} value={category}>
    {category}
  </Checkbox>
));
CategoryCheckbox.displayName = 'CategoryCheckbox';

// Componente de subcategoría memoizado
const SubcategoryCheckbox = memo(({ subcategory }: { subcategory: string }) => (
  <Checkbox key={subcategory} value={subcategory} size="md">
    {subcategory}
  </Checkbox>
));
SubcategoryCheckbox.displayName = 'SubcategoryCheckbox';

// Utilitario puro para parsear rangos de precio
const parsePriceRange = (pricerange: string | null): [number, number] => {
  if (!pricerange) return DEFAULT_PRICE_RANGE;
  const values = pricerange.split('-').map(Number);
  return values.length === 2 && !values.some(isNaN)
    ? [values[0], values[1]]
    : DEFAULT_PRICE_RANGE;
};

const Filters = ({ onFilterChange, setIsInvalidFilters, className, onPendingFiltersChange }: FiltersProps) => {
  const { categories, isLoading, minPrice, maxPrice } = useProductContext();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Estado de filtros aplicados (sincronizados con URL)
  const [filterState, setFilterState] = useState<FilterStateType>(() => DEFAULT_FILTER_STATE);

  // NUEVO: Estado para cambios pendientes (antes de aplicar)
  const [pendingFilters, setPendingFilters] = useState<FilterStateType | null>(null);

  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // Usamos los filtros pendientes si existen, de lo contrario usamos los actuales
  const displayFilters = pendingFilters || filterState;

  // Opciones de categorías memoizadas
  const categoryOptions = useMemo(
    () => [ALL_CATEGORIES, ...categories.map(cat => cat.name)],
    [categories]
  );

  // Determinar si "Todos" está seleccionado (en los filtros pendientes si existen)
  const hasAllCategories = useMemo(
    () => displayFilters.categories.names.includes(ALL_CATEGORIES),
    [displayFilters.categories.names]
  );

  // Calcular opciones de subcategorías disponibles
  const subcategoryOptions = useMemo(() => {
    if (hasAllCategories) return [];

    // Uso de Set para eliminar duplicados automáticamente
    const uniqueSubcategories = new Set<string>();

    categories
      .filter(cat => displayFilters.categories.names.includes(cat.name))
      .forEach(cat => {
        cat.subCategories.forEach(sub => {
          if (sub && sub.name) {
            uniqueSubcategories.add(sub.name);
          }
        });
      });

    return Array.from(uniqueSubcategories);
  }, [categories, displayFilters.categories.names, hasAllCategories]);

  // Función utilitaria para mapear IDs desde parámetros
  const getMappedIds = useCallback((param: string | null, type: 'category' | 'subcategory') => {
    if (!param) return [];

    const items = param.split(',').filter(Boolean);
    if (items.length === 0) return [];

    // Mapeo optimizado con búsqueda precomputada
    const itemMap = new Map();
    categories.forEach(cat => {
      if (type === 'category') {
        itemMap.set(cat.id.toString(), cat.name);
      } else {
        cat.subCategories.forEach(sub => {
          itemMap.set(sub.id.toString(), sub.name);
        });
      }
    });

    return items.map(id => itemMap.get(id) || id);
  }, [categories]);

  // Efecto para sincronizar desde URL a filterState
  useEffect(() => {
    if (categories.length === 0) return;

    const categoryParam = searchParams.get("category");

    // Reset a valores predeterminados cuando no hay parámetros
    if (!searchParams.size || !categoryParam || categoryParam.trim() === "") {
      setFilterState(DEFAULT_FILTER_STATE);
      setPendingFilters(null); // Reiniciar los cambios pendientes también
      return;
    }

    // Crear nuevo objeto de filtros desde la URL
    const newFilters = {
      categories: {
        ids: categoryParam.split(",").filter(Boolean),
        names: getMappedIds(categoryParam, "category"),
      },
      subcategories: {
        ids: searchParams.get("subcategory")?.split(",").filter(Boolean) || [],
        names: getMappedIds(searchParams.get("subcategory"), "subcategory"),
      },
      ratingIndex: Number(searchParams.get("rate")) || 0,
      priceRange: parsePriceRange(searchParams.get("pricerange")),
    };

    setFilterState(newFilters);
    setPendingFilters(null); // Reiniciar los cambios pendientes al actualizar desde URL
  }, [searchParams, categories, getMappedIds]);

  // Efecto para propagar cambios cuando cambian los filtros
  useEffect(() => {
    if (isLoading) return;

    onFilterChange?.({
      categories: hasAllCategories ? [] : filterState.categories.ids,
      subcategories: filterState.subcategories.ids,
      rating: filterState.ratingIndex,
      priceRange: filterState.priceRange,
    });

    // Comprobar si los filtros están en estado predeterminado
    const isDefaultPrice =
      filterState.priceRange[0] === DEFAULT_PRICE_RANGE[0] &&
      filterState.priceRange[1] === DEFAULT_PRICE_RANGE[1];
    const isDefaultRating = filterState.ratingIndex === 0;
    const hasCategoriesSelected = filterState.categories.names.length > 0;

    setIsInvalidFilters(
      isDefaultPrice &&
      isDefaultRating &&
      (!hasCategoriesSelected)
    );
  }, [
    filterState,
    isLoading,
    onFilterChange,
    setIsInvalidFilters,
    hasAllCategories
  ]);

  // Actualizador para filtros pendientes
  const updatePendingFilters = useCallback((updates: Partial<FilterStateType>) => {
    setPendingFilters(prev => {
      // Si no hay cambios pendientes aún, basarse en filterState
      const base = prev || filterState;
      return { ...base, ...updates };
    });
  }, [filterState]);

  // NUEVO: Función para aplicar filtros pendientes
  const applyFilters = useCallback(() => {
    if (!pendingFilters) return;

    // Construir URL con los filtros pendientes
    const params = new URLSearchParams();

    // Añadir categorías
    if (pendingFilters.categories.ids.length > 0) {
      params.set("category", pendingFilters.categories.ids.join(","));
    }

    // Añadir subcategorías
    if (pendingFilters.subcategories.ids.length > 0) {
      params.set("subcategory", pendingFilters.subcategories.ids.join(","));
    }

    // Añadir rating si no es el valor por defecto
    if (pendingFilters.ratingIndex > 0) {
      params.set("rate", pendingFilters.ratingIndex.toString());
    }

    // Añadir rango de precio si no es el valor por defecto
    const [min, max] = pendingFilters.priceRange;
    if (min > 0 || max < 1000) {
      params.set("pricerange", `${min}-${max}`);
    }

    // Actualizar URL
    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false
    });
  }, [pendingFilters, router]);

  // Modificado: Manejar cambios de categoría
  const handleCategoryChange = useCallback(
    (selectedNames: string[]) => {
      let newSelectedNames: string[];
      // Usar displayFilters para acceder al estado actual (pendiente o aplicado)
      const wasAllSelected = displayFilters.categories.names.includes(ALL_CATEGORIES);
      const isAllSelected = selectedNames.includes(ALL_CATEGORIES);

      // Lógica simplificada para manejar "Todos"
      if (!wasAllSelected && isAllSelected) {
        newSelectedNames = [ALL_CATEGORIES];
      } else if (wasAllSelected && selectedNames.length > 1) {
        newSelectedNames = selectedNames.filter(name => name !== ALL_CATEGORIES);
      } else {
        newSelectedNames = selectedNames;
      }

      // Determinar IDs
      const newCategoryIds = newSelectedNames.includes(ALL_CATEGORIES)
        ? []
        : newSelectedNames.map(name => {
          const category = categories.find(cat => cat.name === name);
          return category?.id?.toString() || name;
        });

      // Actualizar filtros pendientes
      updatePendingFilters({
        categories: {
          names: newSelectedNames,
          ids: newCategoryIds
        },
        // Limpiar subcategorías cuando cambian las categorías
        subcategories: { ids: [], names: [] },
      });
    },
    [categories, updatePendingFilters, displayFilters.categories.names]
  );

  // Modificado: Manejar cambios de subcategoría
  const handleSubcategoryChange = useCallback(
    (selectedNames: string[]) => {
      const subcategoryMap = new Map();
      categories.forEach(cat => {
        cat.subCategories.forEach(sub => {
          subcategoryMap.set(sub.name, sub.id?.toString());
        });
      });

      const ids = selectedNames
        .map(name => subcategoryMap.get(name))
        .filter(Boolean);

      // Actualizar filtros pendientes
      updatePendingFilters({
        subcategories: {
          ids,
          names: selectedNames,
        },
      });
    },
    [categories, updatePendingFilters]
  );

  // Modificado: Manejar cambios del slider
  const handlePriceRangeChange = useCallback(
    (value: number | number[]) => {
      const newRange: [number, number] = Array.isArray(value)
        ? [value[0], value[1]]
        : [0, value];

      // Actualizar filtros pendientes
      updatePendingFilters({
        priceRange: newRange,
      });
    },
    [updatePendingFilters]
  );

  // Eliminado: Ya no necesitamos eventos específicos del slider ya que
  // todos los cambios son pendientes hasta que se apliquen

  // Modificado: Manejar cambios en el rating
  const handleRatingChange = useCallback((keys: any) => {
    // Extract the first key from the selection
    const selectedKey = keys && typeof keys.values === 'function'
      ? Array.from(keys.values())[0]
      : keys.currentKey || keys.toString();

    // Actualizar filtros pendientes
    updatePendingFilters({
      ratingIndex: Number(selectedKey),
    });
  }, [updatePendingFilters]);

  // Calcular si hay cambios pendientes para habilitar/deshabilitar el botón
  const hasPendingChanges = !!pendingFilters;

  // Verificar si los filtros son diferentes a los valores predeterminados
  const hasActiveFilters = useMemo(() => {
    const isDefaultPrice =
      filterState.priceRange[0] === DEFAULT_PRICE_RANGE[0] &&
      filterState.priceRange[1] === DEFAULT_PRICE_RANGE[1];
    const isDefaultRating = filterState.ratingIndex === 0;
    const hasOnlyAllCategory =
      filterState.categories.names.length === 1 &&
      filterState.categories.names[0] === ALL_CATEGORIES;

    return !isDefaultPrice ||
      !isDefaultRating ||
      !hasOnlyAllCategory ||
      filterState.subcategories.names.length > 0;
  }, [filterState]);

  // NUEVO: Función para reiniciar todos los filtros
  const resetAllFilters = useCallback(() => {
    setPendingFilters(DEFAULT_FILTER_STATE);
    router.push(window.location.pathname, { scroll: false });
  }, [router]);

  useEffect(() => {
    if (onPendingFiltersChange) {
      onPendingFiltersChange(pendingFilters);
    }
  }, [pendingFilters, onPendingFiltersChange]);

  return (
    <div className={`${className} opacity-0 animate-fade-in h-max mb-4 bg-white dark:bg-gray-900`}>
      <CheckboxGroup
        label="Categorías"
        value={displayFilters.categories.names}
        onChange={handleCategoryChange}
        className="mb-2"
        isRequired
        isInvalid={displayFilters.categories.names.length === 0}
      >
        {categoryOptions.map(category => (
          <CategoryCheckbox key={category} category={category} />
        ))}
      </CheckboxGroup>

      {!hasAllCategories && subcategoryOptions.length > 0 && (
        <CheckboxGroup
          label="Subcategorías"
          value={displayFilters.subcategories.names}
          onChange={handleSubcategoryChange}
          className="mb-4"
        >
          {subcategoryOptions.map(subcategory => (
            <SubcategoryCheckbox key={subcategory} subcategory={subcategory} />
          ))}
        </CheckboxGroup>
      )}

      <div className="mb-4">
        <Slider
          label="Precio:"
          formatOptions={{
            style: "currency",
            currencyDisplay: "narrowSymbol",
            currency: "USD",
          }}
          className="max-w-md"
          value={displayFilters.priceRange}
          maxValue={maxPrice && maxPrice > 0 ? maxPrice : 1000}
          minValue={minPrice && minPrice > 0 ? minPrice : 0}
          step={20}
          onChange={handlePriceRangeChange}
        />
      </div>

      <Select
        label="Clasificación"
        selectedKeys={[displayFilters.ratingIndex.toString()]}
        defaultSelectedKeys={["0"]}
        onSelectionChange={handleRatingChange}
      >
        {ratingOptions.map((option, index) => (
          <SelectItem key={index.toString()} >
            {option}
          </SelectItem>
        ))}
      </Select>

      <div className="flex gap-2 mt-6 sticky inset-x-0 bottom-0 z-50 w-full py-4 bg-white dark:bg-gray-900">
        <Button
          color="primary"
          isDisabled={!hasPendingChanges}
          className="flex-1"
          onClick={applyFilters}
        >
          Aplicar filtros
        </Button>

        {hasActiveFilters && (
          <Button
            color="default"
            variant="bordered"
            onClick={resetAllFilters}
          >
            Limpiar
          </Button>
        )}
      </div>
    </div>
  );
};

export default memo(Filters);
