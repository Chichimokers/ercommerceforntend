"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaArrowLeft, FaShoppingCart, FaMoneyBill } from "react-icons/fa";
import Image from "next/image";
import useCartActions from "@/components/actions";
import { Skeleton } from "@heroui/react";
import React from "react";
import { CustomButton } from "@/components/buttons/custom-button";
import { FaTrash } from "react-icons/fa6";
import { useProductContext } from "@/contexts/product-context";
import { ProductBase } from "@/types/types";

const RelationedProductSection = dynamic(
  () => import("@/components/sections/relationed-products"),
  {
    loading: () => (
      <div className="flex gap-4 overflow-hidden px-4 py-2 rounded-3xl">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 min-w-[240px] max-w-[240px]">
            <div className="animate-pulse bg-default-50/80 rounded-3xl border border-default-100">
              <div className="relative aspect-square w-full bg-default-100 rounded-t-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-default-200 to-default-300 animate-pulse rounded-t-3xl" />
              </div>
              <div className="p-3 sm:p-4 space-y-3">
                <div className="h-5 bg-default-200 rounded-full w-3/4" />
                <div className="h-4 bg-default-200 rounded-full w-1/2" />
                <div className="flex justify-between items-center gap-2">
                  <div className="h-8 bg-default-200 rounded-full w-3/4" />
                  <div className="h-9 w-10 bg-default-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
);
const QuantityAdjuster = dynamic(
  () => import("@/components/buttons/quantity-selector")
);

const defaultProduct: ProductBase = {
  id: "",
  name: "Cargando...",
  price: 0,
  image: "/placeholder-image.jpg",
  description: "Cargando descripción...",
  category: "",
  quantity: 0,
  short_description: "",
  averageRating: 0,
};

const ProductDetailPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const { products } = useProductContext();

  const [productState, setProductState] = useState<{
    data: ProductBase;
    loading: boolean;
    error: string | null;
  }>({
    data: defaultProduct,
    loading: true,
    error: null,
  });

  const [imageState, setImageState] = useState({
    loaded: false,
    error: false,
  });

  const displayProduct = useMemo(() => (
    productState.loading || productState.error || !productState.data
      ? defaultProduct
      : { ...defaultProduct, ...productState.data }
  ), [productState]);

  useEffect(() => {
    if (!id) return;

    const getProductData = async () => {
      try {
        const foundProduct = products?.find(p => p.id.toString() === id);
        if (foundProduct) {
          setProductState(prev => ({ ...prev, data: foundProduct, loading: false }));
          return;
        }

        setProductState(prev => ({ ...prev, loading: true, error: null }));

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}public/product-details?id=${id}`
        );

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        const data = await response.json();
        setProductState(prev => ({ ...prev, data, loading: false }));
      } catch (err) {
        setProductState(prev => ({
          ...prev,
          error: "Hubo un problema al cargar el producto. Intenta nuevamente más tarde.",
          loading: false
        }));
        console.error("Error fetching product:", err);
      }
    };

    getProductData();
  }, [id, products]);

  useEffect(() => {
    setImageState({ loaded: false, error: false });

    const img = new (window.Image as unknown as typeof HTMLImageElement)();
    img.src = displayProduct.image ? `${displayProduct.image}?v=${Date.now()}` : "/nohphoto.jpeg";

    img.onload = () => setImageState({ loaded: true, error: false });
    img.onerror = () => setImageState({ loaded: true, error: true });
  }, [displayProduct.image]);

  const cartActions = useCartActions({
    id: displayProduct.id,
    price: displayProduct.price,
  });

  const CartActions = useMemo(() => (
    !productState.loading && (
      <div className="grid grid-cols-2 gap-2 mt-4 w-full">
        {!cartActions.isInCart && !cartActions.findInCartLocalStorage() ? (
          <CustomButton className="w-full" onClick={cartActions.handleAddToCart}>
            <FaShoppingCart />
            Agregar
          </CustomButton>
        ) : (
          <CustomButton
            className="w-full"
            color="danger"
            onClick={cartActions.handleRemoveFromCart}
          >
            <FaTrash />
            Eliminar
          </CustomButton>
        )}
        <Link
          className="w-full flex flex-row items-center justify-center gap-2 relative overflow-hidden rounded-xl focus:outline-none transition bg-green-500 text-white hover:bg-green-600 text-base py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          href="/shopping-cart"
          onClick={
            !cartActions.isInCart && !cartActions.findInCartLocalStorage()
              ? cartActions.handleAddToCart
              : undefined
          }
        >
          <FaMoneyBill />
          Comprar ahora
        </Link>
      </div>
    )
  ), [productState.loading, cartActions]);

  if (productState.error && id && !productState.loading) {
    return (
      <div className="w-full mx-auto py-10 rounded-xl mt-16">
        <div className="p-5 flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold text-red-600">
            Error al cargar el producto
          </h2>
          <p className="mt-2 text-gray-600">Prueba más tarde</p>
          <Link
            className="mt-4 text-blue-600 hover:underline flex items-center"
            href="/products/"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Volver a todos los productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 md:p-8 lg:p-10">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          <div className="flex-shrink-0 md:w-1/2 lg:w-2/5">
            <div className="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
              {!imageState.loaded && <Skeleton className="rounded-xl w-full h-96" />}

              <Image
                key={displayProduct.image}
                alt={displayProduct.name}
                className={`w-full h-96 object-contain ${imageState.loaded ? 'block' : 'hidden'}`}
                height={320}
                width={320}
                loading="lazy"
                onLoadingComplete={() => setImageState({ loaded: true, error: false })}
                onError={() => setImageState({ loaded: true, error: true })}
                src={
                  imageState.error || !displayProduct.image
                    ? "/nophoto.jpeg"
                    : `${displayProduct.image}?v=${Date.now()}`
                }
              />
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-xl">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${displayProduct.price}
                </p>
                {!productState.loading && (
                  <div className="flex items-center space-x-3">
                    <QuantityAdjuster
                      quantity={cartActions.quantity}
                      isInCart={cartActions.isInCart}
                      handleQuantityInc={cartActions.handleQuantityInc}
                      handleQuantityDec={cartActions.handleQuantityDec}
                      findInCartLocalStorage={cartActions.findInCartLocalStorage}
                      getLocalStorageData={cartActions.getLocalStorageData}
                      productId={displayProduct.id}
                      maxLimit={displayProduct.quantity}
                      className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                    />
                  </div>
                )}
              </div>

              {CartActions}
            </div>
          </div>

          <div className="flex-1 mt-6 md:mt-0">
            <h1 className="text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
              {displayProduct.name}
            </h1>
            <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed">
              <div className="space-y-4 border-l-4 border-blue-500 pl-4">
                {displayProduct.description ? (
                  displayProduct.description.split('\n').map((line, i) => (
                    <p key={i} className="text-gray-700 dark:text-gray-300">
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">No hay descripción disponible</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {!productState.loading && !productState.error && (
          <section className="mt-16">
            <h3 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-white">
              Productos relacionados
            </h3>
            <RelationedProductSection id={displayProduct.id} />
          </section>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductDetailPage);
