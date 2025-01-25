"use client";

import { useEffect, useState } from "react";
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

// Carga dinámica de componentes
const RelationedProductSecction = dynamic(
  () => import("@/components/sections/relationed-products")
);
const QuantityAdjuster = dynamic(
  () => import("@/components/buttons/quantity-selector")
);

// Producto por defecto mientras carga
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

  const [product, setProduct] = useState<ProductBase>(defaultProduct);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!id) return;

    const foundProduct = products?.find((p) => p.id.toString() === id);
    if (foundProduct) {
      setProduct(foundProduct);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}public/product-details?id=${id}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(
          "Hubo un problema al cargar el producto. Intenta nuevamente más tarde."
        );
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, products]);

  const displayProduct =
    loading || error || !product
      ? defaultProduct
      : { ...defaultProduct, ...product };

  const {
    isInCart,
    quantity,
    handleAddToCart,
    handleRemoveFromCart,
    handleQuantityInc,
    handleQuantityDec,
    findInCartLocalStorage,
    getLocalStorageData,
  } = useCartActions({
    id: displayProduct.id,
    price: displayProduct.price,
  });

  useEffect(() => {
    setImageLoaded(false);
  }, [displayProduct.image]);

  if (error && id && !loading) {
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
          {!imageLoaded && (
            <Skeleton className="rounded-lg w-full md:w-96 h-[300px]" />
          )}

          {/* Imagen del producto */}
          <Image
            alt={displayProduct.name}
            className={`rounded-lg w-full md:w-96 object-cover ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            height={320}
            loading="lazy"
            priority={false}
            onError={() => setImageError(true)}
            src={
              imageError
                ? "/nophoto.jpeg"
                : displayProduct.image || "/nophoto.jpeg"
            }
            onLoad={() => setImageLoaded(true)}
            width={320}
          />

          <div className="flex flex-row gap-2 mt-4 justify-between">
            <p className="text-xl font-semibold text-blue-600">
              ${displayProduct.price}
            </p>

            {!loading && (
              <div className="flex h-8 flex-row items-center rounded-full border border-default-200">
                <QuantityAdjuster
                  quantity={quantity}
                  isInCart={isInCart}
                  handleQuantityInc={handleQuantityInc}
                  handleQuantityDec={handleQuantityDec}
                  findInCartLocalStorage={findInCartLocalStorage}
                  getLocalStorageData={getLocalStorageData}
                  productId={displayProduct.id}
                  maxLimit={displayProduct.quantity}
                />
              </div>
            )}
          </div>

          {!loading && (
            <div className="grid grid-cols-2 gap-2 mt-4 w-full">
              {!isInCart && !findInCartLocalStorage() ? (
                <CustomButton className="w-full" onClick={handleAddToCart}>
                  <FaShoppingCart />
                  Agregar
                </CustomButton>
              ) : (
                <CustomButton
                  className="w-full"
                  color="danger"
                  onClick={handleRemoveFromCart}
                >
                  <FaTrash />
                  Eliminar
                </CustomButton>
              )}

              <Link
                className="w-full flex flex-row items-center justify-center gap-2 relative overflow-hidden rounded-xl focus:outline-none transition bg-green-500 text-white hover:bg-green-600 text-base py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                href="/shopping-cart"
                onClick={
                  !isInCart && !findInCartLocalStorage()
                    ? handleAddToCart
                    : undefined
                }
              >
                <FaMoneyBill />
                Comprar ahora
              </Link>
            </div>
          )}
        </div>

        <div className="mt-5 md:mt-0 md:ml-10 flex flex-col">
          <h1 className="text-2xl font-bold">{displayProduct.name}</h1>
          <p className="mt-3 prose dark:prose-invert">
            {displayProduct.description}
          </p>
        </div>
      </div>

      {!loading && !error && (
        <section>
          <RelationedProductSecction id={displayProduct.id} />
        </section>
      )}
    </div>
  );
};

export default React.memo(ProductDetailPage);
