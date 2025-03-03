"use client";

import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
  Badge,
  Chip,
  Tooltip
} from "@heroui/react";
import { CartContext } from "@/contexts/cart-context";
import { FaShoppingCart } from "react-icons/fa";
import { CartItem } from "@/types/interfaces";

import Link from "next/link";
import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context";
import dynamic from "next/dynamic";
import { CustomButton } from "../buttons/custom-button";
import { useProductContext } from "@/contexts/product-context";
import Image from "next/image";

const CartCard = dynamic(() => import("../cards/cart-cards"));
const Price = dynamic(() => import("../price"));

export default function DrawerCart({ className }: { className?: string }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [backdrop, setBackdrop] = React.useState("blur");
  const { cart } = useContext(CartContext) || {};
  const { cartProducts, mutateCartProducts } = useProductContext();
  const { rateExchange } = useContext(CurrencyAndExchangeRateContext) || {};
  const { currency, exchangeRate } = rateExchange || {};
  const [imageLoaded, setImageLoaded] = useState(false);

  const { productMap, convertItem } = useMemo(() => {
    const map = new Map(cartProducts.map((p) => [p.id, p]));
    return {
      productMap: map,
      convertItem: (item: CartItem) => {
        const product = map.get(item.id);
        return product ? { ...product, quantity: item.cantidad } : null;
      }
    };
  }, [cartProducts]);

  const subtotal = useMemo(() => {
    if (!cart) return 0;
    return cart.reduce((total, item) =>
      total + (item.cantidad * (productMap.get(item.id)?.price || 0)), 0);
  }, [cart, productMap]);

  const handleBackdropChange = useCallback((backdrop: string) => {
    setBackdrop(backdrop);
    mutateCartProducts();
    setTimeout(onOpen, 0);
  }, [mutateCartProducts, onOpen]);

  const emptyCartContent = useMemo(() => (
    <div className="w-full flex flex-col items-center justify-center py-8">
      <div className="relative w-full xs:w-3/4 sm:w-2/3 md:w-1/2 h-[30vh] xs:h-[35vh] md:h-[40vh]">
        <Image
          alt="Carrito Vacío"
          className={`object-contain transition-all duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          src="/Empty_Cart.svg"
          onLoad={() => setImageLoaded(true)}
          fill
          quality={Number(process.env.IMAGE_QUALITY) || 75}
          loading="lazy"
        />
      </div>
      <h2 className="text-lg xs:text-xl md:text-2xl text-default-500 font-medium text-center mt-4">
        No hay productos en el carrito
      </h2>
    </div>
  ), [imageLoaded]);

  const cartItemsContent = useMemo(() =>
    cart?.map((item) => {
      const product = convertItem(item);
      return product ? (
        <React.Suspense key={product.id} fallback={<div>Cargando producto...</div>}>
          <CartCard productCart={product} />
        </React.Suspense>
      ) : null;
    })
    , [cart, convertItem]);

  const renderCartItems = useMemo(() =>
    cart?.length ? cartItemsContent : emptyCartContent
    , [cart?.length, cartItemsContent, emptyCartContent]);

  if (!cart) {
    return (
      <div className="flex items-center justify-center h-full rounded-xl">
        Loading cart...
      </div>
    );
  }

  return (
    <>
      <Tooltip
        className="h-auto"
        content={
          cart?.length ?
            <span className="text-sm font-medium">
              Subtotal:{" "}
              <strong>
                {(exchangeRate ? subtotal * exchangeRate : subtotal).toFixed(2)}{" "}
                {currency || "USD"}
              </strong>
            </span>
            :
            <span className="text-sm font-medium">
              <strong>
                Carrito vacio
              </strong>
            </span>
        }
        delay={200}
      >
        <div className="inline-flex">
          <Badge
            style={{ right: "6px", top: "6px" }}
            size="sm"
            className="w-5 h-5 shadow-lg border border-default-500 text-xs"
            content={cart?.length ? cart.length.toString() : undefined}
            shape="circle"
            color="danger"
            showOutline={false}
            isInvisible={!cart?.length}
          >
            <CustomButton
              key={backdrop}
              className={`flex flex-col min-w-10 !p-0 justify-center items-center !w-10 !h-10 !rounded-full !border border-default-600 bg-opacity-50 transition-none ${className}`}
              color="default"
              variant="outlined"
              onClick={() => handleBackdropChange(backdrop)}
            >
              <FaShoppingCart opacity={0.8} size={22} />
            </CustomButton>
          </Badge>
        </div>
      </Tooltip>


      <Drawer
        className="h-full bg-gray-100 dark:bg-gray-800"
        classNames={{
          closeButton: "absolute top-1 right-1",
        }}
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col mt-6 gap-1">
                <div className="flex flex-row justify-between items-center">
                  <h1>Carro de Compras</h1>
                  <Chip color="success" variant="flat">
                    <div className="flex flex-row text-xs xs:text-sm">
                      <span className="text-foreground">Subtotal: </span>
                      <Price
                        amount={(exchangeRate ? subtotal * exchangeRate : subtotal).toFixed(2)}
                        currencyCode={currency || "USD"}
                        className="font-medium ml-1"
                      />
                    </div>
                  </Chip>
                </div>
              </DrawerHeader>
              <DrawerBody>
                {renderCartItems}
              </DrawerBody>

              <DrawerFooter>
                <CustomButton color="danger" variant="filled" onClick={onClose}>
                  Cerrar
                </CustomButton>
                <Link href="/shopping-cart">
                  <CustomButton color="primary" variant="filled">
                    Ir al carrito
                  </CustomButton>
                </Link>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
