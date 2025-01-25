import { categories } from "./categories";
import brands from "./brands";
import { FilterList } from "@/types/types";

const categoriesList: FilterList = {
  values: categories,
  key: "categories",
  label: "Categorias",
};

const brandsList: FilterList = {
  values: brands,
  key: "brands",
  label: "Marcas",
};

const ratingOptions = [
  "Todas las calificaciones",
  "1 estrella o más",
  "2 estrellas o más",
  "3 estrellas o más",
  "4 estrellas o más",
];

const filtersList = new Map<string, FilterList>();

filtersList.set("categories", categoriesList);
filtersList.set("brands", brandsList);

export { filtersList, ratingOptions };
