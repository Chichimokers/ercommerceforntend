// Agrega esto temporalmente en cualquier componente del carrito
import { useCartStore } from "@/store/cart/cart-store";

export default function CartDebugger() {
  const cartState = useCartStore();

  console.log("Zustand cart state:", cartState.cart);

  return null; // Este componente no renderiza nada
}