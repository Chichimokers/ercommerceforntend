import {
  FaUtensils,
  FaShower,
  FaCar,
  FaTv,
  FaPercent,
  FaBagShopping,
  FaComputer,
  FaBaseball,
  FaHouse,
  FaHelicopter,
  FaShirt
} from "react-icons/fa6";

/*const categories = [
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
};*/

const categories = [
  "Electrónica",
  "Deportes",
  "Hogar",
  "Juguetes",
  "Ropa",
];

const categoryIcons = {
  Electrónica: FaComputer,
  Deportes: FaBaseball,
  Hogar: FaHouse,
  Juguetes: FaHelicopter,
  Ropa: FaShirt,
};

const categoryUrls = {
  Electrónica: "/products/electronics",
  Deportes: "/products/sports",
  Hogar: "/products/home",
  Juguetes: "/products/toys",
  Ropa: "/products/clothes",
};

export { categories, categoryIcons, categoryUrls };
