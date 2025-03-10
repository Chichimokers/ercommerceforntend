"use client";

import React, { useContext, useMemo, useState, useEffect, useCallback } from "react";
import { CartContext } from "@/contexts/cart-context";
import { Spinner } from "@heroui/react";
import { useProductContext } from "@/contexts/product-context";
import CartCard from "@/components/cards/cart-cards";
import SmCartCard from "@/components/cards/sm-cart-card";
import OrderSummary from "@components/cards/summary";
import EmptyCart from "@components/empty/empty-cart";
import { useLocation } from "@contexts/location-context";
import useSWR from "swr";
import { useShipping } from "@/contexts/shipping-context";

export default function ShoppingCartPage() {
  const { cart } = useContext(CartContext) || {};
  const { cartProducts, isLoading } = useProductContext();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const fetchUrl = `${process.env.NEXT_PUBLIC_API_URL}public/shipping-price`;
  const { location } = useLocation();
  const { setShippingPrice, setTotalWeight } = useShipping()

  const fetcher = async (url: string) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total_weight: calculateWeight(), municipality: location.municipality })
    })
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse?.message || response.statusText);
    }
    if (calculateWeight() === 0) {
      return 0;
    }
    return response.json()
  }

  const { data: price, error, isLoading: isLoadingPrice } = useSWR(fetchUrl, fetcher, {
    revalidateOnFocus: true,
    shouldRetryOnError: true,
    dedupingInterval: 60000,
  });

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const productMap = useMemo(
    () => new Map(cartProducts?.map((p) => [p.id, p]) || []),
    [cartProducts]
  );

  const calculateSubtotal = useCallback(
    () =>
      cart
        ? cart.reduce((total, item) => {
          const product = productMap.get(item.id);
          if (!product) return total;

          let itemPrice = product.price;

          if (product.discount && item.cantidad >= product.discount.min) {
            itemPrice = itemPrice - product.discount.reduction;
          }
          return total + (itemPrice * item.cantidad);
        }, 0)
        : 0,
    [cart, productMap]
  );

  const calculateWeight = useCallback(
    () =>
      cart
        ? cart.reduce((total, item) => {
          const product = productMap.get(item.id);
          if (!product) return total;
          return total + (product.weight * item.cantidad);
        }, 0)
        : 0,
    [cart, productMap]
  );

  useEffect(() => {
    if (price && !isLoadingPrice) {
      setShippingPrice(price);
    }

    const weight = calculateWeight();
    setTotalWeight(weight);
  }, [price, isLoadingPrice, calculateWeight, setShippingPrice, setTotalWeight]);

  const cartProductsWithQuantity = useMemo(() => {
    if (!cart || !cartProducts.length) return [];

    return cartProducts.filter(product =>
      cart.some(item => item.id === product.id)
    );
  }, [cart, cartProducts]);

  const hasCartProducts = useMemo(() =>
    cartProductsWithQuantity.length > 0,
    [cartProductsWithQuantity]
  );

  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner label="Cargando Productos..." />
      </div>
    );
  }

  return (
    <section className="py-12 mt-16 sm:px-4">
      <div className="container mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white inline-block border-b-4 border-blue-300 pb-2">
            Tu Carrito de Compras
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {hasCartProducts ? (
              <>
                <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 bg-gray-100 dark:bg-gray-800 px-6 py-4 rounded-xl shadow-sm items-center">
                  <div className="font-semibold text-gray-700 dark:text-gray-300">
                    Producto
                  </div>
                  <div className="font-semibold text-center text-gray-700 dark:text-gray-300">
                    Precio Unitario
                  </div>
                  <div className="font-semibold text-center text-gray-700 dark:text-gray-300">
                    Cantidad
                  </div>
                  <div className="font-semibold text-center text-gray-700 dark:text-gray-300">
                    Total
                  </div>
                </div>

                <div className="space-y-4 bg-white dark:bg-gray-900 rounded-xl shadow-md p-4">
                  {cartProductsWithQuantity.map((product) =>
                    isMobile ? (
                      <CartCard
                        key={`${product.id}-mobile-${cart?.length}`}
                        productCart={product}
                      />
                    ) : (
                      <SmCartCard
                        key={`${product.id}-desktop-${cart?.length}`}
                        product={product}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-4"
                      />
                    )
                  )}
                </div>
              </>
            ) : (
              <EmptyCart />
            )}
          </div>

          <div className="lg:col-span-1">
            {isLoadingPrice ?
              <div className="w-full h-full rounded-xl bg-white dark:bg-gray-800 shadow-md animate-pulse"></div>
              :
              <OrderSummary subtotal={calculateSubtotal()} shipping={price} weight={calculateWeight()} />
            }

          </div>
        </div>
      </div>
    </section>
  );
}