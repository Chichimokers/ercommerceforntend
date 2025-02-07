import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";
import { Slider, Select, SelectItem } from "@heroui/react";
import CheckboxGroup from "../checkbox/checkbox-group";
import { useSearchParams } from "next/navigation";
import { useProductContext } from "@/contexts/product-context";
import { ratingOptions } from "./relation";
import FiltersSkeleton from "../skeletons/filters-skeleton";
import { FilterState } from "@/types/types";

interface FiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  setIsInvalidFilters: Dispatch<SetStateAction<boolean>>;
  className?: string;
}

interface FilterStateType {
  categoryIds: string[];
  subcategoryIds: string[];
  categoryNames: string[];
  subcategoryNames: string[];
  ratingIndex: number;
  priceRange: [number, number];
}

const ALL_CATEGORIES = "Todos";
const DEFAULT_PRICE_RANGE: [number, number] = [0, 1000];

const Filters = ({ onFilterChange, setIsInvalidFilters, className }: FiltersProps) => {
  const { categories, isLoading } = useProductContext();
  const searchParams = useSearchParams();

  const [filterState, setFilterState] = useState<FilterStateType>({
    categoryIds: [],
    subcategoryIds: [],
    categoryNames: [ALL_CATEGORIES],
    subcategoryNames: [],
    ratingIndex: 0,
    priceRange: DEFAULT_PRICE_RANGE,
  });

  const categoryOptions = useMemo(
    () => [ALL_CATEGORIES, ...categories.map((cat) => cat.name)],
    [categories]
  );

  const subcategoryOptions = useMemo(() => {
    if (filterState.categoryNames.includes(ALL_CATEGORIES)) return [];

    return categories
      .filter((cat) => filterState.categoryNames.includes(cat.name))
      .flatMap((cat) => cat.subCategories.map((sub) => sub.name));
  }, [categories, filterState.categoryNames]);

  const applyFilters = useCallback(() => {
    if (!onFilterChange) return;

    const filtersToApply: FilterState = {
      categories: filterState.categoryNames.includes(ALL_CATEGORIES)
        ? []
        : filterState.categoryIds,
      subcategories: filterState.subcategoryIds,
      rating: filterState.ratingIndex,
      priceRange: filterState.priceRange,
    };

    onFilterChange(filtersToApply);
  }, [filterState, onFilterChange]);

  useEffect(() => {
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const pricerange = searchParams.get("pricerange");
    const rate = searchParams.get("rate");

    // Si no hay parámetros, mantener valores por defecto
    if (!category && !subcategory && !pricerange && !rate) {
      setFilterState((prev) => ({
        ...prev,
        categoryIds: [],
        subcategoryIds: [],
        categoryNames: [ALL_CATEGORIES],
        subcategoryNames: [],
        ratingIndex: 0,
        priceRange: DEFAULT_PRICE_RANGE,
      }));
      return;
    }

    // Procesar parámetros
    const categoryIds = category?.split(",") || [];
    const subcategoryIds = subcategory?.split(",") || [];

    const priceRangeValues = pricerange
      ? pricerange.split("-").map(Number)
      : DEFAULT_PRICE_RANGE;

    const validPriceRange: [number, number] =
      priceRangeValues.length === 2
        ? [priceRangeValues[0], priceRangeValues[1]]
        : DEFAULT_PRICE_RANGE;

    const rateValue = rate ? Number(rate) : 0;

    // Obtener nombres de categorías
    const categoryNames = categoryIds
      .map(id => {
        const found = categories.find(cat => cat.id.toString() === id);
        return found ? found.name : id; // Mantener ID si no se encuentra
      })
      .filter(name => name); // Filtrar nombres vacíos

    // Actualización optimizada de subcategorías
    const subcategoryNames = categories
      .flatMap(cat =>
        cat.subCategories.filter(sub =>
          subcategoryIds.includes(sub.id.toString())
        )
      )
      .map(sub => sub.name);

    // Actualizar estado
    setFilterState({
      categoryIds,
      subcategoryIds,
      categoryNames,
      subcategoryNames,
      ratingIndex: rateValue,
      priceRange: validPriceRange,
    });
  }, [searchParams, categories, setFilterState]); // Dependencias actualizadas

  useEffect(() => {
    if (!isLoading) {
      applyFilters();
    }
  }, [applyFilters, isLoading]);

  const handleCategoryChange = useCallback(
    (selectedNames: string[]) => {
      // Manejo simplificado de selección de categorías
      const isSelectingAll = selectedNames.includes(ALL_CATEGORIES);

      const newState = {
        categoryNames: isSelectingAll ? [ALL_CATEGORIES] : selectedNames,
        categoryIds: isSelectingAll ? [] : selectedNames.map(name =>
          categories.find(cat => cat.name === name)?.id?.toString() ||
          `temp-${crypto.randomUUID()}` // ID temporal para categorías nuevas
        ),
        subcategoryNames: [],
        subcategoryIds: []
      };

      setFilterState(prev => ({
        ...prev,
        ...newState,
        // Mantener nombres aunque no existan en el contexto
        categoryNames: isSelectingAll ? [ALL_CATEGORIES] : selectedNames
      }));

      setIsInvalidFilters(isSelectingAll || selectedNames.length === 0);
    },
    [categories, setIsInvalidFilters]
  );

  const handleSubcategoryChange = useCallback(
    (selectedNames: string[]) => {
      const ids = selectedNames
        .map((name) =>
          categories
            .flatMap((cat) => cat.subCategories)
            .find((sub) => sub.name === name)
            ?.id?.toString()
        )
        .filter((id): id is string => Boolean(id));

      setFilterState((prev) => ({
        ...prev,
        subcategoryNames: selectedNames,
        subcategoryIds: ids,
      }));
    },
    [categories]
  );

  const handlePriceRangeChange = useCallback((value: number | number[]) => {
    const newRange: [number, number] = Array.isArray(value)
      ? [value[0], value[1]]
      : [0, value];

    setFilterState((prev) => ({
      ...prev,
      priceRange: newRange,
    }));
  }, []);

  return (
    <div className={`${className} opacity-0 animate-fade-in h-max mb-4`}>
      <CheckboxGroup
        label="Categorías"
        options={categoryOptions}
        selected={filterState.categoryNames}
        onChange={handleCategoryChange}
        className="mb-2"
        required
        errorCondition={(selected) => selected.length === 0}
      />

      {filterState.categoryNames.length > 0 &&
        !filterState.categoryNames.includes(ALL_CATEGORIES) &&
        subcategoryOptions.length > 0 && (
          <CheckboxGroup
            label="Subcategorías"
            options={subcategoryOptions}
            selected={filterState.subcategoryNames}
            onChange={handleSubcategoryChange}
            className="mb-4"
          />
        )}

      <div className="mb-4">
        <Slider
          label={"Precio:"}
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
          setFilterState((prev) => ({
            ...prev,
            ratingIndex: Number(selectedKey),
          }));
        }}
      >
        {ratingOptions.map((option, index) => (
          <SelectItem key={index.toString()} value={index.toString()}>
            {option}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default Filters;
