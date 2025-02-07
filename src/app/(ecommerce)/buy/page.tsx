"use client";

import { useContext, useMemo, useState } from "react";
import { Input } from "@heroui/react";
import React from "react";
import { useProductContext } from "@contexts/product-context";
import { CartContext } from "@/contexts/cart-context";
import { CustomButton } from "@/components/buttons/custom-button";
import { PhoneNumberUtil } from "google-libphonenumber";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { convertCartItemToProductBase } from "@utils/productUtils";
import { ProductBase } from "../../../types/types";
import toast, { Toaster } from 'react-hot-toast';
import { ShoppingCartIcon, UserCircleIcon, MapPinIcon, CreditCardIcon } from "lucide-react";
import { AddressForm } from "@components/AddressForm";
import Image from "next/image";

// Esquema de validación con Zod
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
      const number = phoneUtil.parse(value, "ES");
      return phoneUtil.isValidNumber(number);
    } catch {
      return false;
    }
  }, "Teléfono inválido")
});

type FormValues = z.infer<typeof formSchema>;

export default function Buy() {
  /*const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    // Verificaciones del lado del cliente
    const cartItems = localStorage.getItem("cartItems");
    const emailValidated = localStorage.getItem("emailValidated");

    if (!session || !cartItems || !emailValidated) {
      router.push("/");
    }
  }, [session, router]);*/

  const { cart } = useContext(CartContext) || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { products } = useProductContext();

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  });

  // Calculo optimizado del subtotal
  const subtotal = useMemo(() => {
    return cart?.reduce((total, item) => {
      const product = products.find(p => p.id === item.id);
      return total + (product?.price || 0) * item.cantidad;
    }, 0) || 0;
  }, [cart, products]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const productsToSend = cart
        ?.map(item => convertCartItemToProductBase(item, products))
        .filter(Boolean) as ProductBase[];

      const orderData = {
        ...data,
        subtotal,
        products: productsToSend,
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el pedido');
      }

      toast.success('Pedido realizado con éxito!', {
        duration: 4000,
        position: 'top-right',
        icon: '🎉',
      });

      setTimeout(() => {
        window.location.href = '/order-confirmation';
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error: ${errorMessage}`, {
        duration: 5000,
        position: 'top-right',
        icon: '❌',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Componente reutilizable para inputs
  const FormField = ({ label, error, children }: {
    label: string;
    error?: string;
    children: React.ReactNode
  }) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );

  return (
    <section className="flex flex-col items-center justify-center gap-8 py-12 md:py-16 px-4 xl:px-0">
      <Toaster
        toastOptions={{
          className: 'dark:bg-zinc-800 dark:text-white',
          success: {
            className: 'border border-green-500',
          },
          error: {
            className: 'border border-red-500',
          },
        }}
      />
      <div className="inline-block max-w-6xl w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 flex items-center justify-center gap-2">
          <ShoppingCartIcon className="h-8 w-8 text-primary" />
          Finalizar Compra
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sección de Formulario */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-default-200 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-default-200">
              <UserCircleIcon className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Datos Personales</h2>
            </div>

            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Nombre" error={methods.formState.errors.firstName?.message}>
                      <Input
                        {...methods.register("firstName")}
                        startContent={<UserCircleIcon className="h-5 w-5 text-default-400" />}
                        placeholder="Ej: Juan"
                        className="group rounded-xl dark:bg-zinc-800 bg-zinc-50"
                        classNames={{
                          input: "group-hover:bg-zinc-100 dark:group-hover:bg-zinc-700 transition-colors"
                        }}
                      />
                    </FormField>

                    <FormField label="Apellidos" error={methods.formState.errors.lastName?.message}>
                      <Input
                        {...methods.register("lastName")}
                        startContent={<UserCircleIcon className="h-5 w-5 text-default-400" />}
                        placeholder="Ej: Pérez García"
                        className="rounded-xl dark:bg-zinc-800 bg-zinc-50"
                      />
                    </FormField>
                  </div>

                  <div className="flex items-center gap-2 mt-8 mb-6 pb-4 border-b border-default-200">
                    <MapPinIcon className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-semibold">Dirección de Envío</h2>
                  </div>

                  <AddressForm />

                  {/* Sección de Contacto */}
                  <div className="space-y-6">
                    <FormField label="Teléfono" error={methods.formState.errors.phone?.message}>
                      <Input
                        {...methods.register("phone")}
                        startContent={<span className="text-default-400">+34</span>}
                        placeholder="600 000 000"
                        className="rounded-xl dark:bg-zinc-800 bg-zinc-50"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="mt-8 w-full">
                  <CustomButton
                    className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary transition-all"
                    type="submit"
                    isDisabled={isSubmitting}
                    startContent={!isSubmitting && <CreditCardIcon className="h-5 w-5" />}
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? 'Procesando pago...' : 'Confirmar Pedido'}
                  </CustomButton>
                </div>
              </form>
            </FormProvider>
          </div>

          {/* Resumen del Pedido */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-default-200">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <ShoppingCartIcon className="h-6 w-6 text-primary" />
              Resumen del Pedido
            </h2>

            <div className="space-y-4">
              {cart?.map((item) => {
                const product = products.find(p => p.id === item.id);
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-zinc-200 dark:bg-zinc-700 overflow-hidden relative">
                        <Image
                          alt={product?.name || 'producto'}
                          src={product?.image || '/nophoto.jpeg'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{product?.name}</p>
                        <p className="text-sm text-default-500">Cantidad: {item.cantidad}</p>
                      </div>
                    </div>
                    <p className="font-medium">{(product?.price || 0) * item.cantidad}€</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-default-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-default-600">Subtotal:</span>
                <span className="font-semibold">{subtotal}€</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-default-600">Envío:</span>
                <span className="font-semibold">Gratis</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-primary">{subtotal}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
