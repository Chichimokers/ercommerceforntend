import { useEffect, useState, useCallback, useMemo, Dispatch, SetStateAction } from "react";
import { Slider, Select, SelectItem, CheckboxGroup, Checkbox } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { useProductContext } from "@/contexts/product-context";
import { ratingOptions } from "./relation";
import { FilterState } from "@/types/types";

interface FiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  setIsInvalidFilters: Dispatch<SetStateAction<boolean>>;
  className?: string;
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

const Filters = ({ onFilterChange, setIsInvalidFilters, className }: FiltersProps) => {
  const { categories, isLoading } = useProductContext();
  const searchParams = useSearchParams();

  const [filterState, setFilterState] = useState<FilterStateType>(DEFAULT_FILTER_STATE);

  const categoryOptions = useMemo(
    () => [ALL_CATEGORIES, ...categories.map(cat => cat.name)],
    [categories]
  );

  const hasAllCategories = useMemo(
    () => filterState.categories.names.includes(ALL_CATEGORIES),
    [filterState.categories.names]
  );

  const subcategoryOptions = useMemo(() => {
    if (hasAllCategories) return [];
    return categories
      .filter(cat => filterState.categories.names.includes(cat.name))
      .flatMap(cat => cat.subCategories.map(sub => sub.name));
  }, [categories, filterState.categories.names, hasAllCategories]);

  useEffect(() => {
    const getMappedIds = (param: string | null, type: 'category' | 'subcategory') => {
      const items = param?.split(',') || [];
      return items.map(id => {
        const found = categories
          .flatMap(cat => (type === 'category' ? [cat] : cat.subCategories))
          .find(item => item.id.toString() === id);
        return found ? found.name : id;
      });
    };

    if (!searchParams.size) {
      setFilterState(DEFAULT_FILTER_STATE);
      return;
    }

    setFilterState({
      categories: {
        ids: searchParams.get('category')?.split(',') || [],
        names: getMappedIds(searchParams.get('category'), 'category'),
      },
      subcategories: {
        ids: searchParams.get('subcategory')?.split(',') || [],
        names: getMappedIds(searchParams.get('subcategory'), 'subcategory'),
      },
      ratingIndex: Number(searchParams.get('rate')) || 0,
      priceRange: parsePriceRange(searchParams.get('pricerange')),
    });
  }, [searchParams, categories]);

  useEffect(() => {
    // Verificamos si existe el parámetro "category" en la URL
    const categoryParam = searchParams.get("category");
    if (!categoryParam || categoryParam.trim() === "") {
      // Si no hay parámetro o viene vacío, se mantiene el estado por defecto (con "Todos")
      setFilterState(DEFAULT_FILTER_STATE);
      return;
    }

    // Función auxiliar para mapear IDs a nombres según el tipo (categoría o subcategoría)
    const getMappedIds = (param: string | null, type: 'category' | 'subcategory') => {
      const items = param?.split(",") || [];
      return items.map((id) => {
        const found = categories
          .flatMap((cat) => (type === "category" ? [cat] : cat.subCategories))
          .find((item) => item.id.toString() === id);
        return found ? found.name : id;
      });
    };

    setFilterState({
      categories: {
        ids: categoryParam.split(","),
        names: getMappedIds(categoryParam, "category"),
      },
      subcategories: {
        ids: searchParams.get("subcategory")?.split(",") || [],
        names: getMappedIds(searchParams.get("subcategory"), "subcategory"),
      },
      ratingIndex: Number(searchParams.get("rate")) || 0,
      priceRange: parsePriceRange(searchParams.get("pricerange")),
    });
  }, [searchParams, categories]);

  // Efecto centralizado para propagar cambios de filtros
  useEffect(() => {
    if (!isLoading) {
      onFilterChange?.({
        categories: filterState.categories.names.includes(ALL_CATEGORIES)
          ? []
          : filterState.categories.ids,
        subcategories: filterState.subcategories.ids,
        rating: filterState.ratingIndex,
        priceRange: filterState.priceRange,
      });

      const isDefaultPrice =
        filterState.priceRange[0] === DEFAULT_PRICE_RANGE[0] &&
        filterState.priceRange[1] === DEFAULT_PRICE_RANGE[1];
      const isDefaultRating = filterState.ratingIndex === 0;
      const isDefaultCategories = filterState.categories.names.includes(ALL_CATEGORIES);

      setIsInvalidFilters(
        isDefaultPrice &&
        isDefaultRating &&
        (isDefaultCategories || filterState.categories.names.length === 0)
      );
    }
  }, [filterState, isLoading, onFilterChange, setIsInvalidFilters]);

  const updateFilterState = useCallback((partialState: Partial<FilterStateType>) => {
    setFilterState(prev => ({ ...prev, ...partialState }));
  }, []);

  const handleCategoryChange = useCallback(
    (selectedNames: string[]) => {
      const prevSelectedNames = filterState.categories.names;
      let newSelectedNames: string[] = [];

      // Si el usuario agrega "Todos" y antes no estaba seleccionado, se reemplaza toda la selección por "Todos".
      if (
        !prevSelectedNames.includes(ALL_CATEGORIES) &&
        selectedNames.includes(ALL_CATEGORIES)
      ) {
        newSelectedNames = [ALL_CATEGORIES];
      }
      // Si ya estaba "Todos" y se agrega otra opción, se quita "Todos"
      else if (
        prevSelectedNames.includes(ALL_CATEGORIES) &&
        selectedNames.length > 1
      ) {
        newSelectedNames = selectedNames.filter(name => name !== ALL_CATEGORIES);
      }
      // En otros casos, se usa la selección tal cual.
      else {
        newSelectedNames = selectedNames;
      }

      const newCategories = {
        names: newSelectedNames,
        ids: newSelectedNames.includes(ALL_CATEGORIES)
          ? []
          : newSelectedNames.map(name =>
            categories.find(cat => cat.name === name)?.id?.toString() || name
          ),
      };

      updateFilterState({
        categories: newCategories,
        subcategories: { ids: [], names: [] },
      });
    },
    [updateFilterState, categories, filterState.categories.names]
  );




  const handleSubcategoryChange = useCallback(
    (selectedNames: string[]) => {
      const ids = selectedNames
        .map(name =>
          categories
            .flatMap(cat => cat.subCategories)
            .find(sub => sub.name === name)
            ?.id?.toString()
        )
        .filter((id): id is string => Boolean(id));

      updateFilterState({
        subcategories: {
          ids,
          names: selectedNames,
        },
      });
    },
    [categories, updateFilterState]
  );

  const handlePriceRangeChange = useCallback(
    (value: number | number[]) => {
      const newRange: [number, number] = Array.isArray(value)
        ? [value[0], value[1]]
        : [0, value];

      updateFilterState({
        priceRange: newRange,
      });
    },
    [updateFilterState]
  );

  return (
    <div className={`${className} opacity-0 animate-fade-in h-max mb-4`}>
      <CheckboxGroup
        label="Categorías"
        value={filterState.categories.names}
        onChange={handleCategoryChange}
        className="mb-2"
        isRequired
        isInvalid={filterState.categories.names.length === 0}
      >
        {categoryOptions.map(category => (
          <Checkbox key={category} value={category}>
            {category}
          </Checkbox>
        ))}
      </CheckboxGroup>

      {!hasAllCategories && subcategoryOptions.length > 0 && (
        <CheckboxGroup
          label="Subcategorías"
          value={filterState.subcategories.names}
          onChange={handleSubcategoryChange}
          className="mb-4"
        >
          {subcategoryOptions.map(subcategory => (
            <Checkbox key={subcategory} value={subcategory} size="md">
              {subcategory}
            </Checkbox>
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
          value={filterState.priceRange}
          maxValue={1000}
          minValue={0}
          step={20}
          onChange={handlePriceRangeChange}
        />
      </div>

      <Select
        label="Clasificación"
        selectedKeys={[filterState.ratingIndex.toString()]}
        defaultSelectedKeys={[filterState.ratingIndex.toString()]}
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0];
          updateFilterState({
            ratingIndex: Number(selectedKey),
          });
        }}
      >
        {ratingOptions.map((option, index) => (
          <SelectItem key={index.toString()} id={index.toString()}>
            {option}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

function parsePriceRange(pricerange: string | null): [number, number] {
  if (!pricerange) return DEFAULT_PRICE_RANGE;
  const values = pricerange.split('-').map(Number);
  return values.length === 2 ? [values[0], values[1]] : DEFAULT_PRICE_RANGE;
}

export default Filters;
