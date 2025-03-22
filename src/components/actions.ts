import { useCallback, useContext, useState, useMemo, useEffect } from "react";
import { CartContext } from "@/contexts/cart-context";
import { useProductContext } from "@/contexts/product-context";
import { useCartStore } from "@store/cart/cart-store";

const useCartActions = (product: { id: string; price: number }) => {
  const cartContext = useCartStore();
  const { cart, addItem, removeItem, increaseQuantity, decreaseQuantity } = cartContext || {};
  const { mutateCartProducts } = useProductContext();

  const [quantity, setQuantity] = useState(1);

  const isInCart = useMemo(
    () => cart?.some((item: { id: string }) => item.id === product?.id) || false,
    [cart, product?.id]
  );

  useEffect(() => {
    const productInCart = cart?.find((item) => item.id === product?.id);
    setQuantity(productInCart?.cantidad || 1);
  }, [cart, product?.id]);

  const handleMutation = useCallback((action: () => void) => {
    action();
    mutateCartProducts?.();
  }, [mutateCartProducts]);

  const handleAddToCart = useCallback(() => {
    if (!product || quantity <= 0) return;
    handleMutation(() => addItem?.({ id: product.id, price: product.price }, quantity));
  }, [product, quantity, addItem, handleMutation]);

  const handleRemoveFromCart = useCallback(() => {
    handleMutation(() => {
      setQuantity(1);
      removeItem?.(product?.id);
    });
  }, [removeItem, product?.id, handleMutation]);

  const handleQuantityChange = useCallback((operation: 'inc' | 'dec') => {
    console.log(operation)
    const handler = isInCart
      ? (amount: number) => (operation === 'inc' ? increaseQuantity : decreaseQuantity)?.(product.id, amount)
      : operation === 'inc' ? (amount: number) => setQuantity(prev => Math.max(1, prev + amount))
        : (amount: number) => setQuantity(prev => Math.max(1, prev - amount));

    handler(1);
  }, [isInCart, product, increaseQuantity, decreaseQuantity]);

  const findInCartLocalStorage = useCallback(() => {
    return cart?.some((item: { id: string }) => item.id === product?.id) || false;
  }, [cart, product?.id]);

  const getLocalStorageData = useCallback(
    (id: string) => {
      return cart?.find((item: { id: string }) => item.id === id);
    },
    [cart]
  );

  const handleQuantityInc = useCallback(() => handleQuantityChange('inc'), [handleQuantityChange]);
  const handleQuantityDec = useCallback(() => handleQuantityChange('dec'), [handleQuantityChange]);


  return {
    isInCart,
    quantity,
    setQuantity,
    handleAddToCart,
    handleRemoveFromCart,
    handleQuantityInc,
    handleQuantityDec,
    findInCartLocalStorage,
    getLocalStorageData,
  };
};

export default useCartActions;
