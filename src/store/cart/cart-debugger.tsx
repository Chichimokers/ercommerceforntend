import { useCartStore } from "@/store/cart/cart-store";

export default function CartDebugger() {
  const cartState = useCartStore();
  return null;
}