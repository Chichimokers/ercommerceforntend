import React from "react";
import ProfileImageSection from "../../../components/sections/settings-porfile-imagen-section";
import { Form, Input, Switch, cn } from "@heroui/react";
import { monedas } from "@/types/monedas";
import CurrencySelector from "../../../components/selects/currency-selector";
import { CustomButton } from "@/components/buttons/custom-button";

export default function SettingsPage() {
  const [submitted, setSubmitted] = React.useState(null);

  const onSubmit = () => {
    // Manejar envío de formulario
  };

  return (
    <div>
      <ProfileImageSection />
      <div className="container mx-auto p-6 flex justify-center">
        <div className="w-full max-w-4xl bg-white dark:bg-transparent p-4 md:p-6 rounded-lg">
          <Form
            className=" w-full"
            validationBehavior="native"
            onSubmit={onSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-2">
                <h2 className="text-2xl mb-4 font-semibold  dark:text-gray-50">
                  Configuración de Cuenta
                </h2>
                <Input
                  className="mb-3"
                  isRequired
                  errorMessage="Por favor, ingrese un nombre de usuario válido"
                  label="Nombre de usuario"
                  labelPlacement="inside"
                  name="username"
                  variant="bordered"
                  placeholder="Ingrese su nombre de usuario"
                  type="text"
                />
                <Input
                  className="mb-3"
                  isRequired
                  errorMessage="Por favor, ingrese un correo electrónico válido"
                  label="Correo electrónico"
                  variant="bordered"
                  name="email"
                  placeholder="Ingrese su correo electrónico"
                  type="email"
                />
                <Input
                  className="mb-3"
                  variant="bordered"
                  isRequired
                  errorMessage="Por favor, ingrese una contraseña válida"
                  label="Contraseña"
                  labelPlacement="inside"
                  name="password"
                  placeholder="Ingrese su contraseña"
                  type="password"
                />
              </div>

              <div className="mb-2">
                <h2 className="text-2xl font-semibold mb-4 dark:text-gray-50">
                  Configuración de Notificaciones
                </h2>
                <div className="flex flex-1">
                  <Switch
                    classNames={{
                      base: cn(
                        "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
                        "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                        "data-[selected=true]:border-primary"
                      ),
                      wrapper: "p-0 h-4 overflow-visible",
                      thumb: cn(
                        "w-6 h-6 border-2 shadow-lg",
                        "group-data-[hover=true]:border-primary",
                        //selected
                        "group-data-[selected=true]:ml-6",
                        // pressed
                        "group-data-[pressed=true]:w-7",
                        "group-data-[selected]:group-data-[pressed]:ml-4"
                      ),
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-medium">Correo electrónico</p>
                      <p className="text-tiny text-default-400">
                        Recibe avisos por email.
                      </p>
                    </div>
                  </Switch>
                </div>

                <div className="flex-1">
                  <Switch
                    classNames={{
                      base: cn(
                        "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
                        "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                        "data-[selected=true]:border-primary"
                      ),
                      wrapper: "p-0 h-4 overflow-visible",
                      thumb: cn(
                        "w-6 h-6 border-2 shadow-lg",
                        "group-data-[hover=true]:border-primary",
                        //selected
                        "group-data-[selected=true]:ml-6",
                        // pressed
                        "group-data-[pressed=true]:w-7",
                        "group-data-[selected]:group-data-[pressed]:ml-4"
                      ),
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-medium">SMS</p>
                      <p className="text-tiny text-default-400">
                        Recibe avisos por SMS.
                      </p>
                    </div>
                  </Switch>
                </div>
              </div>

              <div className="mb-2">
                <h2 className="text-2xl font-semibold mb-4 dark:text-gray-50">
                  Configuración de Moneda
                </h2>
                <CurrencySelector />
              </div>
            </div>

            <div className="text-center">
              <CustomButton
                color="primary"
                type="submit"
                variant="filled"
                className="font-semibold"
              >
                Guardar Cambios
              </CustomButton>
            </div>

            {submitted && (
              <div className="text-small text-default-500 mt-4">
                Información enviada: <code>{JSON.stringify(submitted)}</code>
              </div>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}
