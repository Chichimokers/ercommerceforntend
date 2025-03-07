import { FilterList } from "@/types/types";
import brands from "./brands";

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

filtersList.set("brands", brandsList);

export { filtersList, ratingOptions };
