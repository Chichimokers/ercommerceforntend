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
  Tooltip,
  Button
} from "@heroui/react";
import { CartContext } from "@/contexts/cart-context";
import { FaTag } from "react-icons/fa";
import { CartItem } from "@/types/interfaces";
import { ShoppingCartIcon } from "lucide-react";

import Link from "next/link";
import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context";
import dynamic from "next/dynamic";
import { CustomButton } from "../buttons/custom-button";
import { useProductContext } from "@/contexts/product-context";
import Image from "next/image";
import { formatCurrency } from "@components/format-currency";

const CartCard = dynamic(() => import("../cards/cart-cards"));

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

  const cartTotals = useMemo(() => {
    if (!cart) return { subtotal: 0, discount: 0, total: 0 };

    let subtotal = 0;
    let discount = 0;

    cart.forEach(item => {
      const product = productMap.get(item.id);
      if (!product) return;

      const itemSubtotal = item.cantidad * product.price;
      subtotal += itemSubtotal;

      if (product.discount && item.cantidad >= product.discount.min) {
        discount += product.discount.reduction * item.cantidad;
      }
    });

    return {
      subtotal,
      discount: parseFloat(discount.toFixed(2)),
      total: parseFloat((subtotal - discount).toFixed(2))
    };
  }, [cart, productMap]);

  const { subtotal, discount, total } = cartTotals;

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

  // Valores formateados para mostrar
  const formattedSubtotal = formatCurrency(
    (exchangeRate ? subtotal * exchangeRate : subtotal),
    currency,
    rateExchange?.symbol
  );

  const formattedDiscount = formatCurrency(
    (exchangeRate ? discount * exchangeRate : discount),
    currency,
    rateExchange?.symbol
  );

  const formattedTotal = formatCurrency(
    (exchangeRate ? total * exchangeRate : total),
    currency,
    rateExchange?.symbol
  );

  return (
    <>
      <Tooltip
        className="h-auto"
        content={
          cart?.length ? (
            <div className="flex flex-col text-sm">
              <span className="font-medium mb-1">
                Price: <strong>{formattedSubtotal}</strong>
              </span>
              {discount > 0 && (
                <>
                  <span className="font-medium text-green-600 dark:text-green-400 flex items-center">
                    <FaTag className="mr-1" size={12} />
                    Ahorro: <strong>{formattedDiscount}</strong>
                  </span>
                  <span className="font-medium mt-1 border-t pt-1">
                    Subtotal: <strong>{formattedTotal}</strong>
                  </span>
                </>
              )}
            </div>
          ) : (
            <span className="text-sm font-medium">
              <strong>Carrito vacío</strong>
            </span>
          )
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
            <Button
              key={backdrop}
              isIconOnly
              className={`flex flex-col min-w-10 !p-0 justify-center items-center !w-10 !h-10 !rounded-full !border border-default-600 hover:border-default-400 bg-blue-50/50 dark:bg-gray-900/50 transition-none ${className}`}
              color="default"
              variant="bordered"
              onPress={() => handleBackdropChange(backdrop)}
            >
              <ShoppingCartIcon opacity={0.8} size={22} />
            </Button>
          </Badge>
        </div>
      </Tooltip>

      <Drawer
        className="h-full bg-white dark:bg-gray-800"
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
              <DrawerHeader className="flex flex-col gap-1 mt-6">
                <div className="flex flex-row justify-between items-center">
                  <h1>Carro de Compras</h1>
                  {cart.length > 0 && (
                    <div className="flex flex-col items-end">
                      <Chip color="success" variant="flat">
                        <div className="flex flex-row text-xs xs:text-sm items-center">
                          <span className="text-foreground mr-1">
                            Subtotal
                          </span>
                          {formattedTotal}
                        </div>
                      </Chip>
                    </div>
                  )}
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
