export interface CartItem {
  id: string;
  cantidad: number;
}

export interface CartState {
  cart: CartItem[];
  AddCartItem: (producto: { id: string; price: number }, mount: number) => void;
  DelCartItem: (producto: { id: string }) => void;
  increaseQuantity: (producto: { id: string }, mount: number) => void;
  decreaseQuantity: (producto: { id: string }, mount: number) => void;
  clearCart: () => void;
}
