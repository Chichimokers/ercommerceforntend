import {
  FaUtensils,
  FaShower,
  FaCar,
  FaTv,
  FaPercent,
  FaBagShopping,
} from "react-icons/fa6";

const categories = [
  "Combos",
  "Ofertas",
  "Alimentos",
  "Aseo",
  "Automotriz",
  "Electrodomésticos",
];

const categoryIcons = {
  Combos: FaBagShopping,
  Ofertas: FaPercent,
  Alimentos: FaUtensils,
  Aseo: FaShower,
  Automotriz: FaCar,
  Electrodomésticos: FaTv,
};

const categoryUrls = {
  Combos: "/products/combos",
  Ofertas: "/products/offers",
  Alimentos: "/products/food",
  Aseo: "/products/beauty",
  Automotriz: "/products/cars",
  Electrodomésticos: "/products/electronics",
};

export { categories, categoryIcons, categoryUrls };
