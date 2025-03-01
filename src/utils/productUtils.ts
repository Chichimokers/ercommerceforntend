import { ProductBase } from "../types/types";
import { CartItem } from "../types/interfaces";

export const convertCartItemToProductBase = (item: CartItem, products: ProductBase[]): ProductBase | undefined => {
  const product = products.find(p => p.id === item.id);
  if (!product) return undefined;

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: item.cantidad,
    short_description: product.short_description
  };
}; 