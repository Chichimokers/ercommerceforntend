"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardBody, Spinner, Tab, Tabs, Tooltip, Badge } from "@heroui/react";
import { Breadcrumbs } from "@components/breadcrumb/breadcrumbs";
import { ShoppingCart, Truck, Share2, TriangleAlert, ShoppingBag } from "lucide-react";
import { WeightIcon, Check, X, AlertTriangle } from "lucide-react";

import { useProductContext } from "@/contexts/product-context";
import { useCurrencyStore } from "@store/currency/currency-store";
import useCartActions from "@/components/actions";

import { CustomButton } from "@/components/buttons/custom-button";
import QuantityAdjuster from "@/components/buttons/quantity-selector";
import ProductImageGallery from "@components/product-image-gallery";
import ErrorBoundary from "@components/error-boundary";
import { SEO } from "@/components/seo";
import { formatCurrency } from "@components/format-currency";
import RelatedProductSection from "@components/sections/relationed-products";
import { CurrencyData } from "../../../../types/types";
import { useCartStore } from "@store/cart/cart-store";

interface ProductImageGalleryProps {
  images: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  enableZoom?: boolean;
}

// Hook para detectar si el dispositivo es de bajo rendimiento
const useDeviceCapabilities = () => {
  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Comprobar preferencias de reducción de movimiento
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Detectar dispositivo móvil
    const mobileCheck = window.innerWidth < 768;
    setIsMobile(mobileCheck);

    // Comprobar capacidades del dispositivo
    const isLowEnd =
      navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4 ||
      'connection' in navigator &&
      // @ts-ignore - Connection API no está completamente tipada
      (navigator.connection?.saveData || ['slow-2g', '2g'].includes(navigator.connection?.effectiveType));

    setIsLowPerformance(prefersReducedMotion || isLowEnd);

    // Listener para cambios de tamaño
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isLowPerformance, isMobile };
};

// Componente para mostrar disponibilidad del producto
const StockIndicator = ({ quantity }: { quantity: number }) => {
  if (quantity <= 0) {
    return (
      <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm font-medium" role="status">
        <X size={16} className="text-red-500" aria-hidden="true" />
        <span>No disponible</span>
      </div>
    );
  }

  if (quantity <= 5) {
    return (
      <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-sm font-medium" role="status">
        <AlertTriangle size={16} className="text-amber-500" aria-hidden="true" />
        <span>¡Solo quedan {quantity}!</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium" role="status">
      <Check size={16} className="text-green-500" aria-hidden="true" />
      <span>En stock</span>
    </div>
  );
};

// Componente precio
const ProductPrice = ({
  displayPrice,
  discountedPrice,
  discount,
  quantity,
  minForDiscount,
  rateExchange
}: {
  displayPrice: number;
  discountedPrice: number | null;
  discount?: { reduction: number };
  quantity: number;
  minForDiscount?: number;
  rateExchange: CurrencyData | null;
}) => {
  return (
    <div className="mt-4">
      {discountedPrice ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-2xl md:text-3xl font-bold text-primary">
            {formatCurrency(discountedPrice, rateExchange?.currency, rateExchange?.symbol)}
          </span>
          <span className="text-lg text-gray-500 line-through">
            {formatCurrency(displayPrice, rateExchange?.currency, rateExchange?.symbol)}
          </span>
          <Badge color="danger" className="text-xs font-medium px-2">
            (-{discount && discount?.reduction && ((discount.reduction * 100 * (rateExchange?.exchangeRate || 1)) / displayPrice).toFixed(2)}%)
          </Badge>
        </div>
      ) : (
        <span className="text-2xl md:text-3xl font-bold text-primary">
          {formatCurrency(displayPrice, rateExchange?.currency, rateExchange?.symbol)}
        </span>
      )}

      {discount && minForDiscount && quantity < minForDiscount && (
        <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
          Compra {minForDiscount} o más para obtener un {((discount.reduction * 100 * (rateExchange?.exchangeRate || 1)) / displayPrice).toFixed(2)}% de descuento
        </div>
      )}
    </div>
  );
};

// Botones de acción principales
const ActionButtons = ({
  product,
  isInCart,
  quantity,
  onAddToCart,
  onRemoveFromCart,
  onIncrement,
  onDecrement,
  findInCartLocalStorage,
  getLocalStorageData,
  isMobile
}: {
  product: any;
  isInCart: boolean;
  quantity: number;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  findInCartLocalStorage: any;
  getLocalStorageData: any;
  isMobile: boolean;
}) => {
  const router = useRouter();
  return (
    <div className="mt-6">
      <div className={isMobile ? 'w-full mb-2' : ''}>
        <QuantityAdjuster
          quantity={quantity}
          isInCart={isInCart}
          handleQuantityInc={onIncrement}
          handleQuantityDec={onDecrement}
          findInCartLocalStorage={findInCartLocalStorage}
          getLocalStorageData={getLocalStorageData}
          productId={product.id}
          maxLimit={product.quantity}
          className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
          aria-label="Ajustar cantidad"
        />
      </div>
      <div className={`mt-6 flex ${isMobile ? 'flex-col' : ''} gap-3`}>
        <CustomButton
          onClick={isInCart ? onRemoveFromCart : onAddToCart}
          className={`${isMobile ? 'w-full' : 'flex-1'} py-3`}
          variant="filled"
          color={isInCart ? "danger" : "primary"}
          aria-label={isInCart ? "Remover del carrito" : "Añadir al carrito"}
        >
          <ShoppingCart className="mr-2" aria-hidden="true" />
          <span>{isInCart ? "Remover del carrito" : "Añadir al carrito"}</span>
        </CustomButton>

        <CustomButton
          onClick={() => {
            // Usar directamente la función addItem del store para establecer exactamente la cantidad deseada
            const { addItem } = useCartStore.getState();

            // Si está en el carrito, quitarlo primero
            if (isInCart) {
              router.push("/shopping-cart");
            } else {
              setTimeout(() => {
                // Agregar directamente con la cantidad actual
                if (product && product.id) {
                  addItem({ id: product.id, price: product.price }, quantity);
                }
                router.push("/shopping-cart");
              }, 0);
            }

          }}
          isDisabled={product.quantity === 0}
          className={`${isMobile ? 'w-full' : 'flex-1'} py-3`}
          variant="filled"
          color="success"
          aria-label="Comprar ahora"
        >
          <ShoppingBag className="mr-2" aria-hidden="true" />
          <span>Comprar ahora</span>
        </CustomButton>
      </div>
    </div>
  );
};

const ProductInfo = ({ product }: { product: any }) => {
  return (
    <div className="mt-6 border-t border-b border-gray-200 dark:border-gray-700 py-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center">
          <Truck className="text-gray-500 mr-2" size={16} aria-hidden="true" />
          <span>Envío desde: <strong>{product.province}</strong></span>
        </div>

        <div className="flex items-center">
          <WeightIcon className="text-gray-500 mr-2" size={16} aria-hidden="true" />
          <span>Peso: <strong>{product.weight} kg</strong></span>
        </div>

        {product.category && (
          <div className="flex items-center">
            <span className="text-gray-700 dark:text-gray-300">Categoría: <strong>{product.category}</strong></span>
          </div>
        )}

        {product.subcategory && (
          <div className="flex items-center">
            <span className="text-gray-700 dark:text-gray-300">Subcategoría: <strong>{product.subcategory}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};

// Página principal de detalles del producto
export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const productId = Array.isArray(id) ? id[0] : id;
  const { isLowPerformance, isMobile } = useDeviceCapabilities();

  const [activeTab, setActiveTab] = useState("details");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [shareTooltip, setShareTooltip] = useState("Copiar enlace");

  const { rateExchange } = useCurrencyStore();
  const { products } = useProductContext();

  // Obtener datos del producto
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        // Primero intentamos encontrar el producto en el contexto
        const cachedProduct = products?.find(p => p.id.toString() === productId);

        if (cachedProduct) {
          setProduct(cachedProduct);
          setIsLoading(false);
          return;
        }

        // Si no está en el contexto, lo buscamos en la API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}public/product-details?id=${productId}`,
          { cache: 'force-cache' }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("No pudimos cargar la información del producto. Por favor, inténtalo de nuevo.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, products]);

  // Acciones del carrito
  const {
    quantity,
    isInCart,
    findInCartLocalStorage,
    getLocalStorageData,
    handleAddToCart,
    handleRemoveFromCart,
    handleQuantityInc,
    handleQuantityDec
  } = useCartActions(product);

  // Calcular valores derivados
  const breadcrumbItems = useMemo(() => [
    { label: 'Inicio', href: '/' },
    { label: 'Productos', href: '/products' },
    { label: product?.name || 'Detalles del producto' }
  ], [product?.name]);

  const displayPrice = useMemo(() => {
    if (!product || !rateExchange) return 0;
    return product.price * (rateExchange.exchangeRate || 1);
  }, [product, rateExchange]);

  const discountedPrice = useMemo(() => {
    if (!product?.discount || !displayPrice) return null;
    if (quantity >= product.discount.min) {
      return displayPrice - product.discount.reduction * (rateExchange?.exchangeRate || 1);
    }
    return null;
  }, [displayPrice, product, quantity]);

  // Manejadores de eventos
  const handleTabChange = useCallback((key: React.Key) => {
    setActiveTab(key.toString());
  }, []);

  const handleShare = useCallback(async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || 'Producto de Esaki',
          text: product?.short_description || 'Mira este producto en Esaki',
          url
        });
      } catch (err) {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  }, [product]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setShareTooltip('¡Enlace copiado!');
        setTimeout(() => setShareTooltip('Copiar enlace'), 2000);
      })
      .catch(() => {
        setShareTooltip('Error al copiar');
        setTimeout(() => setShareTooltip('Copiar enlace'), 2000);
      });
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-lg">
          <div className="flex items-center">
            <TriangleAlert className="text-red-500 mr-4 text-2xl" />
            <div>
              <h2 className="text-red-700 dark:text-red-300 text-xl font-bold">Ha ocurrido un error</h2>
              <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
              <button
                onClick={() => router.back()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Volver atrás
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando producto...</p>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${product.name} | Esaki`}
        description={product.short_description}
        image={product.image}
        type="product"
      />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna de imágenes - ahora ocupa el espacio completo */}
          <div className="lg:col-span-4">
            <ErrorBoundary fallback={<div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 flex items-center justify-center h-[400px]">
              <p>No se pudieron cargar las imágenes</p>
            </div>}>
              <div className="sticky top-20 w-full"> {/* Quitar flex justify-center */}
                {/* Quitar el div con max-w-md */}
                <ProductImageGallery
                  images={[product.image || '/placeholder.jpg']}
                  selectedIndex={selectedImage}
                  onSelect={setSelectedImage}
                  enableZoom={!isLowPerformance && !isMobile}
                  className="w-full"
                />
              </div>
            </ErrorBoundary>
          </div>

          {/* Columna de información del producto */}
          <div className="lg:col-span-8 space-y-6">
            <div className={isLowPerformance ? "" : "animate-fadeInUp"}>
              <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex-grow">
                  {product.name}
                </h1>

                <Tooltip content={shareTooltip}>
                  <button
                    onClick={handleShare}
                    aria-label="Compartir producto"
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Share2 className="text-gray-600 dark:text-gray-400" />
                  </button>
                </Tooltip>
              </div>

              <StockIndicator quantity={product.quantity} />

              <ProductPrice
                displayPrice={displayPrice}
                discountedPrice={discountedPrice}
                discount={product.discount}
                quantity={quantity}
                minForDiscount={product.discount?.min}
                rateExchange={rateExchange}
              />

              <p className="mt-4 text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                {product.short_description}
              </p>

              <ActionButtons
                product={product}
                isInCart={isInCart}
                quantity={quantity}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onIncrement={handleQuantityInc}
                onDecrement={handleQuantityDec}
                findInCartLocalStorage={findInCartLocalStorage}
                getLocalStorageData={getLocalStorageData}
                isMobile={isMobile}
              />

              <ProductInfo product={product} />
            </div>
          </div>
        </div>

        {/* Pestañas de información adicional */}
        <div className="mt-12">
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={handleTabChange}
            variant="underlined"
            className="w-full"
            aria-label="Información del producto"
            disableAnimation={isLowPerformance}
          >
            <Tab key="details" title={<span className="px-1">Descripción</span>}>
              <Card className="bg-gray-50 dark:bg-gray-800/80 mt-4" shadow="sm">
                <CardBody className="p-6">
                  <div className="prose dark:prose-invert max-w-none">
                    {product.description ? (
                      product.description.split('\n').map((paragraph: string, idx: number) => (
                        <p key={idx} className="mb-4 text-gray-700 dark:text-gray-300">{paragraph}</p>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">No hay descripción disponible para este producto.</p>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Tab>

            <Tab key="specs" title={<span className="px-1">Especificaciones</span>}>
              <Card className="bg-gray-50 dark:bg-gray-800/80 mt-4" shadow="sm">
                <CardBody className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <tbody>
                        <tr className="border-b dark:border-gray-700">
                          <td className="py-3 px-4 font-medium w-1/3">Categoría</td>
                          <td className="py-3 px-4">{product.category || '-'}</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700">
                          <td className="py-3 px-4 font-medium">Subcategoría</td>
                          <td className="py-3 px-4">{product.subcategory || '-'}</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700">
                          <td className="py-3 px-4 font-medium">Peso</td>
                          <td className="py-3 px-4">{product.weight} kg</td>
                        </tr>
                        <tr className="border-b dark:border-gray-700">
                          <td className="py-3 px-4 font-medium">Provincia</td>
                          <td className="py-3 px-4">{product.province}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>

        <div className="mt-16">
          <ErrorBoundary fallback={<div className="text-center py-8">No se pudieron cargar productos relacionados</div>}>
            <div className={isLowPerformance ? "" : "animate-fadeInUp"}>
              <RelatedProductSection
                id={product.id}
              />
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
}