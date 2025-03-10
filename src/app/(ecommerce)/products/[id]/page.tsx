"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { motion } from "framer-motion";
import { Button, Card, CardBody, Spinner, Tab, Tabs, Tooltip } from "@heroui/react";
import { Breadcrumbs } from "@components/breadcrumb/breadcrumbs";
import { FaExchangeAlt, FaHeart, FaShoppingCart, FaStar, FaTruck } from "react-icons/fa";
import { FaBagShopping, FaShield } from "react-icons/fa6";
import { Zoom } from "react-awesome-reveal";

import { useProductContext } from "@/contexts/product-context";
import { useCurrency } from "@/contexts/exchange-rate-currency-context";
import useCartActions from "@/components/actions";

import { CustomButton } from "@/components/buttons/custom-button";
import QuantityAdjuster from "@/components/buttons/quantity-selector";
import ProductImageGallery from "@components/product-image-gallery";
import ErrorBoundary from "@components/error-boundary";
import { SEO } from "@/components/seo";

import { formatCurrency } from "@components/format-currency";
import RelatedProductSection from "@components/sections/relationed-products";
import { WeightIcon } from "lucide-react";

export type ProductBase = {
  id: string;
  name: string;
  price: number;
  short_description: string;
  description: string;
  category?: string;
  subcategory?: string;
  image?: string;
  quantity: number;
  averageRating?: number;
  province: string;
  weight: number;
  discount?: {
    min: number;
    reduction: number;
  };
};

const ProductReviews = React.lazy(() => import("@/components/product-reviews"));

export default function ProductDetailPage() {
  const { id } = useParams();
  const productId = Array.isArray(id) ? id[0] : id;

  const [activeTab, setActiveTab] = useState("details");
  const [selectedImage, setSelectedImage] = useState(0);

  const { rateExchange } = useCurrency();
  const { products } = useProductContext();

  const [productState, setProductState] = useState<{
    data: ProductBase | null;
    loading: boolean;
    error: string | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!productId) return;

    const getProductData = async () => {
      try {
        const foundProduct = products?.find((p) => p.id.toString() === productId);
        if (foundProduct) {
          setProductState({ data: foundProduct, loading: false, error: null });
          return;
        }

        setProductState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}public/product-details?id=${productId}`
        );

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        const data = await response.json();
        setProductState({ data, loading: false, error: null });
      } catch (err) {
        setProductState((prev) => ({
          ...prev,
          error: "Hubo un problema al cargar el producto.",
          loading: false,
        }));
      }
    };

    getProductData();
  }, [productId, products]);

  const product = productState.data;
  const loading = productState.loading;
  const error = productState.error;

  const {
    quantity,
    isInCart,
    findInCartLocalStorage,
    getLocalStorageData,
    handleAddToCart,
    handleRemoveFromCart,
    handleQuantityInc,
    handleQuantityDec
  } = useCartActions(product as ProductBase);

  const breadcrumbItems = useMemo(() => {
    return [
      { label: 'Productos', href: '/products' },
      { label: product?.name || 'Detalles del producto' }
    ];
  }, [product?.name]);

  const displayPrice = useMemo(() => {
    if (!product || !rateExchange) return 0;
    return product.price * (rateExchange.exchangeRate || 1);
  }, [product, rateExchange]);

  const discountedPrice = useMemo(() => {
    if (!product?.discount || !displayPrice) return null;
    if (quantity >= product.discount.min) {
      return displayPrice * (1 - product.discount.reduction / 100);
    }
    return null;
  }, [displayPrice, product, quantity]);

  const handleTabChange = useCallback((key: React.Key) => {
    setActiveTab(key.toString());
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <h2 className="text-red-700 text-xl font-bold">Error loading product</h2>
          <p className="text-red-600">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  if (loading || !product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${product.name} | Esaki`}
        description={product.short_description}
        image={product.image}
      />

      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ErrorBoundary fallback={<div>Error loading images</div>}>
              <ProductImageGallery
                images={[product.image || '/placeholder.jpg']}
                selectedIndex={selectedImage}
                onSelect={setSelectedImage}
              />
            </ErrorBoundary>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{product.name}</h1>

              {/*product.averageRating !== undefined && (
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.averageRating || 0)
                        ? "text-yellow-400"
                        : "text-gray-300"
                        }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-600">
                    {product.averageRating.toFixed(1)} 0 reviews
                  </span>
                </div>
              )*/}

              <div className="mt-4">
                {discountedPrice ? (
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-primary">
                      {formatCurrency(discountedPrice, rateExchange?.currency, rateExchange?.symbol)}
                    </span>
                    <span className="ml-3 text-lg text-gray-500 line-through">
                      {formatCurrency(displayPrice, rateExchange?.currency, rateExchange?.symbol)}
                    </span>
                    <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      -{product.discount?.reduction}%
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {formatCurrency(displayPrice, rateExchange?.currency, rateExchange?.symbol)}
                  </span>
                )}

                {product.discount && quantity < product.discount.min && (
                  <div className="mt-2 text-sm text-blue-600">
                    Compra {product.discount.min} o más para obtener un {product.discount.reduction}% de descuento
                  </div>
                )}
              </div>

              <p className="mt-4 text-gray-600 dark:text-gray-300">{product.short_description}</p>

              <div className="mt-6 flex items-center space-x-3">
                <QuantityAdjuster
                  quantity={quantity}
                  isInCart={isInCart}
                  handleQuantityInc={handleQuantityInc}
                  handleQuantityDec={handleQuantityDec}
                  findInCartLocalStorage={findInCartLocalStorage}
                  getLocalStorageData={getLocalStorageData}
                  productId={product.id}
                  maxLimit={product.quantity}
                  className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                />

                <CustomButton
                  onClick={isInCart ? handleRemoveFromCart : handleAddToCart}
                  className="flex-1 py-3"
                  variant="filled"
                  color={isInCart ? "danger" : "primary"}
                >
                  <FaShoppingCart className="mr-2" />
                  {isInCart ? "Remover del carrito" : "Añadir al carrito"}
                </CustomButton>

                <CustomButton
                  onClick={handleAddToCart}
                  isDisabled={product.quantity === 0}
                  className="flex-1 py-3"
                  variant="filled"
                  color="success"
                >
                  <FaBagShopping className="mr-2" />
                  Comprar ahora
                </CustomButton>

                {/*<Tooltip content="Añadir a favoritos">
                  <Button isIconOnly variant="flat" aria-label="Favorite">
                    <FaHeart className="text-gray-500 hover:text-red-500 transition-colors" />
                  </Button>
                </Tooltip>*/}
              </div>

              {product.quantity === 0 && (
                <div className="mt-3 text-red-500">Producto no disponible</div>
              )}

              {product.quantity > 0 && product.quantity <= 5 && (
                <div className="mt-3 text-amber-500">¡Solo quedan {product.quantity} unidades!</div>
              )}
            </motion.div>

            <div className="mt-6 border-t border-b border-gray-200 dark:border-gray-700 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/*<div className="flex items-center">
                  <FaShield className="text-gray-500 mr-2" />
                  <span>Garantía: 30 días</span>
                </div>*/}
                <div className="flex items-center">
                  <FaTruck className="text-gray-500 mr-2" size={16} />
                  <span>Envío: {product.province}</span>
                </div>

                <div className="flex items-center">
                  <WeightIcon className="text-gray-500 mr-2" size={16} />
                  <span>Peso: {product.weight} kg</span>
                </div>
                {/*<div className="flex items-center">
                  <FaExchangeAlt className="text-gray-500 mr-2" />
                  <span>Política de devolución</span>
                </div>*/}

              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={handleTabChange}
            variant="underlined"
            className="w-full"
          >
            <Tab key="details" title="Detalles">
              <Card className="bg-gray-100 dark:bg-gray-800" shadow="none">
                <CardBody>
                  <div className="prose dark:prose-invert max-w-none">
                    {product.description.split('\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </Tab>

            <Tab key="specs" title="Especificaciones">
              <Card className="bg-gray-100 dark:bg-gray-800" shadow="none">
                <CardBody>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Categoría</td>
                        <td>{product.category || '-'}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Subcategoría</td>
                        <td>{product.subcategory || '-'}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Peso</td>
                        <td>{product.weight} kg</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 font-medium">Provincia</td>
                        <td>{product.province}</td>
                      </tr>
                    </tbody>
                  </table>
                </CardBody>
              </Card>
            </Tab>

            {/*<Tab key="reviews" title="Reseñas">
              <ErrorBoundary fallback={<div>Error loading reviews</div>}>
                <Suspense fallback={<div className="p-8 flex justify-center"><Spinner /></div>}>
                  <ProductReviews productId={product.id} />
                </Suspense>
              </ErrorBoundary>
            </Tab>*/}
          </Tabs>
        </div>

        <div className="mt-16">
          <ErrorBoundary fallback={<div>Error loading related products</div>}>
            <Zoom triggerOnce>
              <Suspense fallback={<div className="h-60 flex justify-center items-center"><Spinner /></div>}>
                <RelatedProductSection
                  id={product.id}
                />
              </Suspense>
            </Zoom>
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
}