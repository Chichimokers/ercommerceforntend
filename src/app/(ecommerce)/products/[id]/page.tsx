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

const RelationedProductSecction = dynamic(
  () => import("@/components/sections/relationed-products")
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
      <div className="w-full mx-auto py-10 rounded-lg">
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
    <div className="w-full mx-auto py-10 rounded-lg">
      <div className="p-5 flex flex-col md:flex-row mx-4">
        <div className="flex-shrink-0">
          <Link
            className="text-blue-600 hover:underline flex items-center mb-5"
            href="/products/"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Volver a todos los productos
          </Link>

          {/* Mostrar el esqueleto mientras se carga la imagen */}
          {!imageState.loaded && (
            <Skeleton className="rounded-lg w-full md:w-96 h-[300px]" />
          )}

          {/* Imagen del producto */}
          <Image
            alt={displayProduct.name}
            className={`rounded-lg w-full md:w-96 object-cover ${imageState.loaded ? "opacity-100" : "opacity-0"
              }`}
            height={320}
            loading="lazy"
            priority={false}
            onError={() => setImageState(prev => ({ ...prev, error: true }))}
            src={
              imageState.error
                ? "/nophoto.jpeg"
                : displayProduct.image || "/nophoto.jpeg"
            }
            onLoad={() => setImageState(prev => ({ ...prev, loaded: true }))}
            width={320}
          />

          <div className="flex flex-row gap-2 mt-4 justify-between">
            <p className="text-xl font-semibold text-blue-600">
              ${displayProduct.price}
            </p>

            {!productState.loading && (
              <div className="flex h-8 flex-row items-center rounded-full border border-default-200">
                <QuantityAdjuster
                  quantity={cartActions.quantity}
                  isInCart={cartActions.isInCart}
                  handleQuantityInc={cartActions.handleQuantityInc}
                  handleQuantityDec={cartActions.handleQuantityDec}
                  findInCartLocalStorage={cartActions.findInCartLocalStorage}
                  getLocalStorageData={cartActions.getLocalStorageData}
                  productId={displayProduct.id}
                  maxLimit={displayProduct.quantity}
                />
              </div>
            )}
          </div>

          {CartActions}
        </div>

        <div className="mt-5 md:mt-0 md:ml-10 flex flex-col">
          <h1 className="text-2xl font-bold">{displayProduct.name}</h1>
          <p className="mt-3 prose dark:prose-invert">
            {displayProduct.description}
          </p>
        </div>
      </div>

      {!productState.loading && !productState.error && (
        <section>
          <RelationedProductSecction id={displayProduct.id} />
        </section>
      )}
    </div>
  );
};

export default React.memo(ProductDetailPage);
