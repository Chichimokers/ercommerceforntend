"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Input, Spinner } from "@heroui/react";
import React from "react";
import { useProductContext } from "@contexts/product-context";
import { CartContext } from "@/contexts/cart-context";
import { PhoneNumberUtil } from "google-libphonenumber";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import { ShoppingCartIcon, UserCircleIcon, MapPinIcon, CreditCardIcon, IdCard } from "lucide-react";
import { AddressForm } from "@components/AddressForm";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { FormField } from "@components/forms/form-field";
import InputField from "@components/forms/input";
import { formatCurrency } from "@components/format-currency";
import { CurrencyAndExchangeRateContext } from "@/contexts/exchange-rate-currency-context";
import { useShipping } from "@contexts/shipping-context";


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
  }, "Teléfono inválido")
});

type FormValues = z.infer<typeof formSchema>;

export default function BuyPage() {
  const { cart } = useContext(CartContext) || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { products, isLoading } = useProductContext();
  const { data: session } = useSession();
  const { rateExchange } = useContext(CurrencyAndExchangeRateContext) || {};
  const { shippingPrice, totalWeight } = useShipping();
  const rateShippingPrice = (shippingPrice! * (rateExchange?.exchangeRate || 1))

  const productMap = useMemo(
    () => new Map(products?.map((p) => [p.id, p]) || []),
    [products]
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

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  });

  useEffect(() => {
    console.log("Errores actuales:", methods.formState.errors);
  }, [methods.formState.errors]);

  const subtotal = useMemo(() => {
    return (
      cart?.reduce((total, item) => {
        const product = products.find((p) => p.id === item.id);
        return total + (product?.price || 0) * item.cantidad;
      }, 0) || 0
    );
  }, [cart, products]);

  const onSubmit = async (data: FormValues) => {
    console.log("Intentando enviar formulario");
    setIsSubmitting(true);
    try {
      const orderProducts = cart?.map((item) => ({
        product_id: item.id,
        quantity: item.cantidad
      }));

      const orderData = {
        products: orderProducts,
        province: data.province,
        address: `${data.municipality}, ${data.district}, ${data.street} ${data.houseNumber}`,
        receiver_name: `${data.firstName} ${data.lastName}`,
        ci: data.idCard,
        phone: data.phone
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

      // Obtener la respuesta del servidor
      const orderResult = await response.json();

      // Guardar detalles del pedido en localStorage (ajusta los campos según lo que retorne tu API)
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

      localStorage.removeItem("cart")

      toast.success("Pedido realizado con éxito!", {
        duration: 4000,
        position: "bottom-right",
        icon: "🎉"
      });

      setTimeout(() => {
        window.location.href = "/order-confirmation";
      }, 1000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error: ${errorMessage}`, {
        duration: 5000,
        position: "top-right",
        icon: "❌"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner label="Cargando Productos..." />
      </div>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center gap-8 py-12 md:py-16 px-4 xl:px-0 mt-16">
      <Toaster
        toastOptions={{
          className: "dark:bg-gray-900/50 dark:text-white",
          success: {
            className: "border border-green-500"
          },
          error: {
            className: "border border-red-500"
          }
        }}
      />
      <div className="inline-block max-w-6xl w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 flex items-center justify-center gap-2">
          <ShoppingCartIcon className="h-8 w-8 text-primary" />
          Finalizar Compra
        </h1>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-md border border-default-200 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-default-200">
              <UserCircleIcon className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Datos Personales (Destinatario)</h2>
            </div>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        placeholder="59009301"
                        className="rounded-xl dark:bg-gray-900/50 bg-gray-100"
                        onChange={(e) => {
                          methods.setValue("phone", e.target.value);
                        }}
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
                  <AddressForm />
                </div>
                <div className="mt-8 w-full">
                  <button
                    type="submit"
                    className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary transition-all rounded-xl"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Procesando pago..."
                      : "Confirmar Pedido"}
                  </button>
                </div>
              </form>
            </FormProvider>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-md border border-default-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <ShoppingCartIcon className="h-6 w-6 text-primary" />
              Resumen del Pedido
            </h2>
            <div className="space-y-4">
              {cart?.map((item) => {
                const product = products.find((p) => p.id === item.id);
                //TODO
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                        <Image
                          alt={product?.name || "producto"}
                          src={product?.image || "/nophoto.jpeg"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{product?.name}</p>
                        <p className="text-sm text-default-500">
                          Cantidad: {item.cantidad}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      {product?.discount && item.cantidad >= product.discount.min ?
                        (formatCurrency((((product?.price - product.discount.reduction) * item.cantidad) * (rateExchange?.exchangeRate || 1)), rateExchange?.currency, rateExchange?.symbol))
                        :
                        formatCurrency((((product?.price || 0) * item.cantidad) * (rateExchange?.exchangeRate || 1)), rateExchange?.currency, rateExchange?.symbol)
                      }
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 pt-6 border-t border-default-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-default-600">Subtotal:</span>
                <span className="font-semibold">{formatCurrency((calculateSubtotal() * (rateExchange?.exchangeRate || 1)), rateExchange?.currency, rateExchange?.symbol)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-default-600">Envío:</span>
                <span className="font-semibold">{formatCurrency(rateShippingPrice, rateExchange?.currency, rateExchange?.symbol)}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(((calculateSubtotal() + shippingPrice!) * (rateExchange?.exchangeRate || 1)), rateExchange?.currency, rateExchange?.symbol)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
