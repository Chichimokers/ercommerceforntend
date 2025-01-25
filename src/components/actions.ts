import { useCallback, useContext, useState, useMemo, useEffect } from "react";
import { CartContext } from "@/contexts/cart-context";
import { useProductContext } from "@/contexts/product-context";

const useCartActions = (product: { id: string; price: number }) => {
  const cartContext = useContext(CartContext);
  const { cart, AddCartItem, DelCartItem, increaseQuantity, decreaseQuantity } = cartContext || {};
  const [quantity, setQuantity] = useState(1);
  const {mutateCartProducts} = useProductContext()
  // Verificar si el producto está en el carrito
  const isInCart = useMemo(
    () => cart?.some((item: { id: string }) => item.id === product.id) || false,
    [cart, product.id]
  );

  //Quyantity y la cantidad del carrito no se sincronizaban por eso daba errores 
  //NO se esta actualizando cuando cambia el id en la pagina del shoping cart
  
  useEffect(() => {
   //me parece que la condicional estaba de mas if(isInCart) ==> si no era asi no restablecia la cantidad al cambiar de id 
   //el estado se inicializaba pero no cambiaba con el id 
      const productInCart = cart?.find((item: { id: string }) => item.id === product.id);
      setQuantity(productInCart?.cantidad || 1);
    
    console.log(quantity)
  }, [cart, isInCart, product.id]);

 
  const handleAddToCart = useCallback(() => {
    if (!product || quantity <= 0) return;
    AddCartItem?.({ id: product.id, price: product.price }, quantity);
    mutateCartProducts()
  }, [product, quantity, AddCartItem]);

 //Lo mas logico es manejar las mutaciones desde el action pero igual a veces
 //O al navegar a la pagina del shoping cart o el drawer 
 //en el drawer lo puse talves al navegar tambien para no hacer mutacioner inecesarias 
 //A hay algunas particularidades en el drawer con los nombres largos 
 //y no se pq no se aumenta la cantidad pero necesito dormir ya despues vere creo que es relacionado con el map del shopingcart
 //y la interaccion con los botones de ma y meno ta lenta otrave ):
  const handleRemoveFromCart = useCallback(() => {
    if (!product) return;
    setQuantity(1);
    DelCartItem?.({ id: product.id });
    mutateCartProducts()
  }, [product, DelCartItem]);


  const handleQuantityInc = useCallback(() => {
    if (isInCart) {
      increaseQuantity?.(product, 1);
     
    } else {
      setQuantity((prevQuantity) => Math.max(1, prevQuantity + 1));
    }
  }, [isInCart, product, increaseQuantity]);


  const handleQuantityDec = useCallback(() => {
    if (isInCart) {
      decreaseQuantity?.(product, 1);
      
    } else{
      setQuantity((prevQuantity) => Math.max(1, prevQuantity - 1));
    }
  }, [isInCart, product, decreaseQuantity]);

  const findInCartLocalStorage = useCallback(() => {
    return cart?.some((item: { id: string }) => item.id === product.id) || false;
  }, [cart, product.id]);

  const getLocalStorageData = useCallback(
    (id: string) => {
      return cart?.find((item: { id: string }) => item.id === id);
    },
    [cart]
  );

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
