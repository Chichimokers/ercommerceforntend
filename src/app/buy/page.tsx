"use client";

import { useCallback, useContext, useMemo, useState } from "react";
import { Input } from "@heroui/react";
import React from "react";
import { CartItem } from "@/types/interfaces";
import { products } from "@/test-data/products";
import { CartContext } from "@/contexts/cart-context";
import { CustomButton } from "@/components/buttons/custom-button";
import { PhoneNumberUtil } from "google-libphonenumber";

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

  const [errors, setErrors] = useState<any>({});
  const phoneUtil = PhoneNumberUtil.getInstance();

  // Values
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [municipality, setMunicipality] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  const [houseNumber, setHouseNumber] = useState<string>("");
  const [idCard, setIdCard] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const { cart } = useContext(CartContext) || {};

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  const calculateSubtotal = useCallback(() => {
    return cart
      ? cart.reduce(
          (total, item) =>
            total + item.cantidad * (productMap.get(item.id)?.price ?? 0),
          0
        )
      : 0;
  }, [cart, productMap]);

  const convertCartItemToProductBase = useCallback(
    (item: CartItem) => {
      const product = productMap.get(item.id);
      return product ? { ...product, quantity: item.cantidad } : null;
    },
    [productMap]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let validationErrors: any = {};

    // Validar campos requeridos
    const formElements = e.target as HTMLFormElement;
    const formData = new FormData(formElements);

    formData.forEach((value, key) => {
      if (!value) {
        validationErrors[key] = `${key} es obligatorio.`;
      }
    });

    // Validación de teléfono
    const phoneInput = formData.get("phone") as string;
    if (phoneInput) {
      try {
        const phoneNumber = phoneUtil.parse(phoneInput, "ES"); // 'ES' es para España, ajusta si es otro país
        if (!phoneUtil.isValidNumber(phoneNumber)) {
          validationErrors.phone = "Número de teléfono no válido";
        }
      } catch (error) {
        validationErrors.phone = "Número de teléfono no válido";
      }
    }

    // Aquí agregarías otras validaciones como el carnet de identidad si es necesario
    // Ejemplo: Validación del carnet de identidad
    const idCardInput = formData.get("idCard") as string;
    if (idCardInput && idCardInput.length < 10) {
      validationErrors.idCard = "Carnet de identidad no válido";
    }

    // Si hay errores, actualizar el estado
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // No continuar con el submit
    }

    // Si no hay errores, puedes enviar el formulario o continuar con el proceso
    console.log("Formulario enviado correctamente");
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 xs:px-8 xl:px-0">
      <div className="inline-block max-w-6xl w-full">
        <div className="gap-4">
          <div className="dark:bg-black bg-white w-full">
            <p className="mb-4 xs:text-lg sm:text-xl xl:text-2xl">
              Informacion del receptor
            </p>

            <p className="text-zinc-500 dark:text-gray-500 mb-2">
              La siguiente información sera encriptada y solo utilizada para el
              envío de su pedido.
            </p>

            <form
              onSubmit={handleSubmit}
              className="p-4 rounded-xl dark:bg-zinc-900 shadow-lg border border-default-200"
            >
              {/* Datos personales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  className="mt-1 block w-full rounded-2xl dark:bg-black"
                  label="Nombre"
                  placeholder="Nombre"
                  required={true}
                  type="text"
                  name="firstName"
                  value={firstName}
                  size="lg"
                  onValueChange={setFirstName}
                />
                {errors.firstName && (
                  <span className="text-red-500">{errors.firstName}</span>
                )}
                <Input
                  className="mt-1 block w-full rounded-2xl dark:bg-black"
                  label="Apellidos"
                  placeholder="Apellidos"
                  required={true}
                  type="text"
                  name="lastName"
                  value={lastName}
                  size="lg"
                  onValueChange={setLastName}
                />
                {errors.lastName && (
                  <span className="text-red-500">{errors.lastName}</span>
                )}
              </div>

              <div className="grid grid-cols-1 xxs:grid-cols-2 gap-2 mt-2">
                <Input
                  className="mt-1 block w-full rounded-2xl dark:bg-black"
                  label="Provincia"
                  placeholder="Provincia"
                  required={true}
                  type="text"
                  name="province"
                  value={province}
                  size="lg"
                  onValueChange={setProvince}
                />
                {errors.province && (
                  <span className="text-red-500">{errors.province}</span>
                )}
                <Input
                  className="mt-1 block w-full rounded-2xl dark:bg-black"
                  label="Municipio"
                  placeholder="Municipio"
                  required={true}
                  type="text"
                  name="municipality"
                  value={municipality}
                  size="lg"
                  onValueChange={setMunicipality}
                />
                {errors.municipality && (
                  <span className="text-red-500">{errors.municipality}</span>
                )}
              </div>

              {/* Ciudad, CP y Provincia */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                <Input
                  className="mt-1 block w-full rounded-2xl dark:bg-black"
                  label="Reparto"
                  placeholder="Reparto"
                  required={true}
                  type="text"
                  name="district"
                  value={district}
                  size="lg"
                  onValueChange={setDistrict}
                />
                {errors.district && (
                  <span className="text-red-500">{errors.district}</span>
                )}
                <Input
                  className="mt-1 block w-full rounded-2xl dark:bg-black"
                  label="Calle"
                  placeholder="Calle"
                  required={true}
                  type="text"
                  name="street"
                  value={street}
                  size="lg"
                  onValueChange={setStreet}
                />
                {errors.street && (
                  <span className="text-red-500">{errors.street}</span>
                )}
                <Input
                  className="mt-1 block w-full rounded-2xl dark:bg-black"
                  label="Numero"
                  placeholder="Casa o apartamento"
                  required={true}
                  type="text"
                  name="houseNumber"
                  value={houseNumber}
                  size="lg"
                  onValueChange={setHouseNumber}
                />
                {errors.houseNumber && (
                  <span className="text-red-500">{errors.houseNumber}</span>
                )}
              </div>

              {/* Teléfono */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <Input
                  className="mt-1 block w-full rounded-2xl dark:bg-black"
                  label="Carnet de identidad"
                  placeholder="Carnet de identidad"
                  required={true}
                  type="text"
                  name="idCard"
                  value={idCard}
                  size="lg"
                  onValueChange={setIdCard}
                />
                {errors.idCard && (
                  <span className="text-red-500">{errors.idCard}</span>
                )}
                <Input
                  className="mt-1 block w-full rounded-2xl dark:bg-black"
                  label="Teléfono de contacto"
                  placeholder="Teléfono de contacto"
                  required={true}
                  type="tel"
                  name="phone"
                  value={phone}
                  size="lg"
                  onValueChange={setPhone}
                />
                {errors.phone && (
                  <span className="text-red-500">{errors.phone}</span>
                )}
              </div>

              {/* Botón de envío */}
              <div className="mt-4 w-full">
                <CustomButton className="w-full" type="submit">
                  Confirmar Pedido
                </CustomButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
