"use client";

import { useCallback, useContext, useEffect, useMemo, useState, lazy, Suspense } from "react";
import { Spinner } from "@heroui/react";
import { useProductContext } from "@contexts/product-context";
import { CartContext } from "@/contexts/cart-context";
import { PhoneNumberUtil } from "google-libphonenumber";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import { ShoppingCartIcon, UserCircleIcon, MapPinIcon, IdCard, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { FormField } from "@components/forms/form-field";
import InputField from "@components/forms/input";
import { formatCurrency } from "@components/format-currency";
import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context";
import Link from "next/link";

// Cargar componentes menos críticos de forma diferida
const AddressForm = lazy(() => import("@components/AddressForm").then(mod => ({ default: mod.AddressForm })));

// Schema de validación definido fuera del componente para evitar recreaciones
const formSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres"),
  lastName: z.string().min(2, "Mínimo 2 caracteres"),
  province: z.string().min(3, "Mínimo 3 caracteres"),
  municipality: z.string().min(3, "Mínimo 3 caracteres"),
  district: z.string().min(3, "Mínimo 3 caracteres"),
  street: z.string().min(3, "Mínimo 3 caracteres"),
  houseNumber: z.string().min(1, "Requerido"),
  idCard: z.string().min(10, "Mínimo 10 caracteres"),
  phone: z.string().refine((value) => {
    try {
      const phoneUtil = PhoneNumberUtil.getInstance();
      const number = phoneUtil.parse(value, "CU");
      return phoneUtil.isValidNumber(number);
    } catch {
      return false;
    }
  }, "Teléfono inválido"),
  aux_phone: z.union([
    z.string().trim().length(0),
    z.string().refine((value) => {
      try {
        const phoneUtil = PhoneNumberUtil.getInstance();
        const number = phoneUtil.parse(value, "CU");
        return phoneUtil.isValidNumber(number);
      } catch {
        return false;
      }
    }, "Teléfono inválido")
  ])
    .optional()
    .transform(val => val === "" ? undefined : val)
});

type FormValues = z.infer<typeof formSchema>;

// Componentes memoizados para la lista de productos
const ProductItem = memo(({ item, product, rateExchange }: { item: CartItem, product: ProductBase | undefined, rateExchange: CurrencyData | null }) => {
  if (!product) {
    return (
      <div
        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-amber-200 dark:border-amber-800"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden relative flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="font-medium text-amber-700 dark:text-amber-300">Producto no disponible</p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              ID: {item.id.substring(0, 8)}...
            </p>
          </div>
        </div>
        <p className="font-medium text-amber-700 dark:text-amber-300">-</p>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50"
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
          <Image
            alt={product.name || "producto"}
            src={product.image || "/nophoto.jpeg"}
            fill
            className="object-cover"
            sizes="48px"
            loading="lazy"
          />
        </div>
        <div>
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-default-500">
            Cantidad: {item.cantidad}
          </p>
        </div>
      </div>
      <p className="font-medium">
        {product.discount && item.cantidad >= product.discount.min ?
          (formatCurrency((((product.price - product.discount.reduction) * item.cantidad) * (rateExchange?.exchangeRate || 1)), rateExchange?.currency, rateExchange?.symbol))
          :
          formatCurrency((((product.price || 0) * item.cantidad) * (rateExchange?.exchangeRate || 1)), rateExchange?.currency, rateExchange?.symbol)
        }
      </p>
    </div>
  );
});
ProductItem.displayName = 'ProductItem';

// Componente principal optimizado
export default function BuyPage() {
  const { cart, clearCart } = useContext(CartContext) || { cart: [], setCart: () => { } };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { products, isLoading } = useProductContext();
  const { data: session } = useSession();
  const { rateExchange } = useContext(CurrencyAndExchangeRateContext) || {};
  const [missingProducts, setMissingProducts] = useState<string[]>([]);
  const [isCartReady, setIsCartReady] = useState(false);

  // Referencia persistente para evitar recreaciones en cada renderizado
  const formSubmitRef = useRef(false);

  // Memoización del mapa de productos para mejor rendimiento
  const productMap = useMemo(
    () => new Map(products?.map((p) => [p.id, p]) || []),
    [products]
  );

  // Efecto para verificar productos faltantes (reducido a lo esencial)
  useEffect(() => {
    if (!cart?.length || !products.length) return;

    const missing = cart.filter(item => !productMap.has(item.id)).map(item => item.id);
    setMissingProducts(missing);
    setIsCartReady(missing.length === 0);
  }, [cart, products, productMap]);

  // Cálculo optimizado de subtotal
  const calculateSubtotal = useCallback(() => {
    if (!cart?.length || !isCartReady) return 0;

    return cart.reduce((total, item) => {
      const product = productMap.get(item.id);
      if (!product) return total;

      let itemPrice = product.price;
      if (product.discount && item.cantidad >= product.discount.min) {
        itemPrice = itemPrice - product.discount.reduction;
      }
      return total + (itemPrice * item.cantidad);
    }, 0);
  }, [cart, productMap, isCartReady]);

  // Memo del subtotal para evitar recálculos
  const subtotal = useMemo(() => calculateSubtotal(), [calculateSubtotal]);

  // Configuración del formulario con defaultValues para mejorar rendimiento
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      idCard: '',
      phone: '',
      aux_phone: '',
      district: '',
      street: '',
      houseNumber: '',
      province: '',
      municipality: ''
    },
    mode: 'onBlur' // Validar al perder el foco para mejor experiencia
  });

  // Optimización de la función de envío
  const onSubmit = useCallback(async (data: FormValues) => {
    // Prevenir múltiples envíos
    if (formSubmitRef.current) return;
    formSubmitRef.current = true;

    setIsSubmitting(true);
    try {
      const orderProducts = cart?.map((item) => ({
        product_id: item.id,
        quantity: item.cantidad
      }));

      // Objeto de orden optimizado
      const orderData = {
        products: orderProducts,
        municipality: data.municipality,
        address: `${data.district}, ${data.street} ${data.houseNumber}`,
        receiver_name: `${data.firstName} ${data.lastName}`,
        ci: data.idCard,
        phone: data.phone,
        ...(data.aux_phone ? { aux_phone: data.aux_phone } : {})
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}userpublic/create-order`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(orderData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en el pedido");
      }

      const orderResult = await response.json();

      localStorage.setItem(
        "orderDetails",
        JSON.stringify({
          id: orderResult.id,
          receiver_name: orderResult.receiver_name,
          phone: orderResult.phone,
          province: orderResult.province,
          address: orderResult.address,
          CI: orderResult.CI,
          subtotal: orderResult.subtotal,
          created_at: orderResult.created_at,
          status: orderResult.status,
        })
      );

      if (clearCart) {
        clearCart();
      }

      toast.success("Pedido realizado con éxito!", {
        duration: 4000,
        position: "bottom-right",
        icon: "🎉"
      });

      // Redirección optimizada con Router
      window.location.href = "/order-confirmation";
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error: ${errorMessage}`, {
        duration: 5000,
        position: "top-right",
        icon: "❌"
      });
      formSubmitRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  }, [cart, session, clearCart]);

  // Estados derivados memoizados
  const isButtonDisabled = useMemo(() =>
    isSubmitting ||
    !cart?.length ||
    missingProducts.length > 0, // 👈 Aquí está la condición solicitada
    [isSubmitting, cart, missingProducts]);

  const buttonText = useMemo(() =>
    isSubmitting
      ? "Procesando pago..."
      : missingProducts.length > 0
        ? "Productos no disponibles"
        : "Confirmar Pedido",
    [isSubmitting, missingProducts]);

  // Pantalla de carga optimizada
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner label="Cargando Productos..." />
      </div>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center gap-8 py-12 md:py-16 px-4 xl:px-0">
      <Toaster
        toastOptions={{
          className: "dark:bg-gray-900/50 dark:text-white",
          success: { className: "border border-green-500" },
          error: { className: "border border-red-500" }
        }}
      />
      <div className="inline-block max-w-6xl w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 flex items-center justify-center gap-2">
          <ShoppingCartIcon className="h-8 w-8 text-primary" />
          Finalizar Compra
        </h1>

        {missingProducts.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 dark:bg-amber-900/20 dark:border-amber-700 text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="flex-shrink-0 h-5 w-5" />
            <p>
              Algunos productos de tu carrito ya no están disponibles. Por favor,
              <Link href="/shopping-cart" className="underline font-medium mx-1">regresa al carrito</Link>
              para actualizar tu pedido.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-md border border-default-200 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-default-200">
              <UserCircleIcon className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Datos Personales (Destinatario)</h2>
            </div>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Campos del formulario optimizados */}
                    <FormField
                      label="Nombre"
                      error={methods.formState.errors.firstName?.message}
                    >
                      <InputField
                        {...methods.register("firstName")}
                        startContent={
                          <UserCircleIcon className="h-5 w-5 text-default-400" />
                        }
                        placeholder="Ej: Juan"
                        className="group rounded-xl dark:bg-gray-900/50 bg-gray-100"
                      />
                    </FormField>
                    {/* Resto de campos... */}
                    <FormField
                      label="Apellidos"
                      error={methods.formState.errors.lastName?.message}
                    >
                      <InputField
                        {...methods.register("lastName")}
                        startContent={
                          <UserCircleIcon className="h-5 w-5 text-default-400" />
                        }
                        placeholder="Ej: Pérez García"
                        className="rounded-xl dark:bg-gray-900/50 bg-gray-100"
                      />
                    </FormField>
                    <FormField
                      label="Teléfono"
                      error={methods.formState.errors.phone?.message}
                    >
                      <InputField
                        {...methods.register("phone")}
                        startContent={<span className="text-default-400">+53</span>}
                        placeholder="########"
                        className="rounded-xl dark:bg-gray-900/50 bg-gray-100"
                      />
                    </FormField>
                    <FormField
                      label="Teléfono Auxiliar"
                      error={methods.formState.errors.aux_phone?.message}
                    >
                      <InputField
                        {...methods.register("aux_phone")}
                        startContent={<span className="text-default-400">+53</span>}
                        placeholder="########"
                        className="rounded-xl dark:bg-gray-900/50 bg-gray-100"
                      />
                    </FormField>
                    <FormField
                      label="Carnet de Identidad"
                      error={methods.formState.errors.idCard?.message}
                    >
                      <InputField
                        {...methods.register("idCard")}
                        startContent={
                          <span className="text-default-400">
                            <IdCard />
                          </span>
                        }
                        placeholder="03030355697"
                        className="rounded-xl dark:bg-gray-900/50 bg-gray-50"
                      />
                    </FormField>
                  </div>
                  <div className="flex items-center gap-2 mt-8 mb-6 pb-4 border-b border-default-200">
                    <MapPinIcon className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-semibold">Dirección de Envío</h2>
                  </div>
                  <Suspense fallback={
                    <div className="space-y-4 animate-pulse">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-[72px] bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                        ))}
                      </div>
                    </div>
                  }>
                    <AddressForm />
                  </Suspense>
                </div>
                <div className="mt-8 w-full">
                  <button
                    type="submit"
                    className={`w-full py-6 text-lg font-semibold transition-all rounded-xl 
                      ${isButtonDisabled
                        ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                        : "bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary"
                      }`}
                    disabled={isButtonDisabled}
                  >
                    {buttonText}
                  </button>

                  {missingProducts.length > 0 && (
                    <p className="text-sm text-center mt-2 text-amber-700 dark:text-amber-400">
                      Debes quitar los productos no disponibles antes de confirmar
                    </p>
                  )}
                </div>
              </form>
            </FormProvider>
          </div>

          {/* Resumen del pedido optimizado */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-md border border-default-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <ShoppingCartIcon className="h-6 w-6 text-primary" />
              Resumen del Pedido
            </h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {cart?.map((item) => (
                <ProductItem
                  key={item.id}
                  item={item}
                  product={productMap.get(item.id)}
                  rateExchange={rateExchange}
                />
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-default-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-default-600">Subtotal:</span>
                <span className="font-semibold">{formatCurrency((subtotal * (rateExchange?.exchangeRate || 1)), rateExchange?.currency, rateExchange?.symbol)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { memo, useRef } from "react";
import { CartItem } from "../../../types/interfaces"; import { CurrencyData, ProductBase } from "../../../types/types";

