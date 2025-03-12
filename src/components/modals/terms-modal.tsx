import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure
} from "@heroui/react";
import { ScrollShadow } from "@heroui/react";

export const TermsModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <span
        className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpen();
        }}
      >
        Términos y Condiciones
      </span>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="3xl"
        scrollBehavior="inside"
        backdrop="blur"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95",
          header: "border-b border-gray-200 dark:border-gray-800",
          footer: "border-t border-gray-200 dark:border-gray-800",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-gray-800 dark:text-gray-200">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300">
                  Términos y Condiciones
                </h2>
                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  Última actualización: 10 de marzo de 2025
                </p>
              </ModalHeader>
              <ModalBody>
                <ScrollShadow className="h-[60vh] pr-4">
                  <div className="space-y-6 text-gray-700 dark:text-gray-300">
                    <section>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">1. Introducción</h3>
                      <p>
                        Estos Términos y Condiciones ("Términos") rigen el uso del sitio web y servicios de EsAki ("nosotros", "nuestro" o "la Compañía"),
                        disponible en https://esaki-jrr.com. Al acceder o utilizar nuestro servicio, usted acepta estar sujeto a estos Términos.
                        Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">2. Definiciones</h3>
                      <p>
                        <strong>"Usuario"</strong>: cualquier persona que acceda o utilice el servicio.<br />
                        <strong>"Producto"</strong>: bienes o servicios ofrecidos en nuestra plataforma.<br />
                        <strong>"Contenido"</strong>: información, textos, gráficos, imágenes u otros materiales cargados, descargados o que aparecen en nuestro servicio.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">3. Uso del Servicio</h3>
                      <p>
                        Nuestro servicio permite a los usuarios navegar, seleccionar y comprar productos para enviar a Cuba.
                        El uso de nuestro servicio está sujeto a la aceptación de estos Términos y Condiciones y a las leyes y regulaciones aplicables.
                      </p>
                      <p className="mt-2">
                        Usted se compromete a no utilizar nuestro servicio:
                      </p>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>De manera que viole cualquier ley o regulación aplicable.</li>
                        <li>Para explotar o dañar, o intentar explotar o dañar, a menores de edad.</li>
                        <li>Para transmitir material que sea difamatorio, obsceno, ofensivo, acosador o invasivo de la privacidad de otros.</li>
                        <li>Para hacerse pasar por otra persona o entidad.</li>
                        <li>De cualquier manera que pueda desactivar, sobrecargar, dañar o perjudicar el funcionamiento del servicio.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">4. Cuentas</h3>
                      <p>
                        Al crear una cuenta con nosotros, usted garantiza que:
                      </p>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Tiene al menos 18 años de edad.</li>
                        <li>La información proporcionada es precisa, completa y actual.</li>
                        <li>Mantendrá la confidencialidad de su contraseña.</li>
                        <li>Es responsable de todas las actividades que ocurran bajo su cuenta.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">5. Compras y Pagos</h3>
                      <p>
                        Al realizar una compra, acepta proporcionar información actual, completa y precisa para todas las compras realizadas.
                        Nos reservamos el derecho de rechazar o cancelar su pedido en cualquier momento por razones que incluyen, pero no se limitan a:
                        disponibilidad del producto, errores en la descripción o precio del producto, o error en su pedido.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">6. Envíos a Cuba</h3>
                      <p>
                        Nuestros servicios incluyen el envío de productos a Cuba. El usuario reconoce que estos envíos están sujetos a:
                      </p>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Regulaciones de importación de Cuba</li>
                        <li>Posibles retrasos aduaneros</li>
                        <li>Tarifas o impuestos aplicables en destino</li>
                        <li>Restricciones en ciertos productos</li>
                      </ul>
                      <p className="mt-2">
                        No nos hacemos responsables por confiscaciones, demoras o cargos adicionales impuestos por las autoridades cubanas.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">7. Cambios en los Términos</h3>
                      <p>
                        Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento.
                        Si la revisión es material, intentaremos notificarle con al menos 30 días de anticipación antes de que los nuevos términos entren en vigencia.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">8. Contacto</h3>
                      <p>
                        Si tiene alguna pregunta sobre estos Términos, por favor contáctenos en:
                      </p>
                      <p className="mt-2 font-medium">
                        contacto@esaki-jrr.com<br />
                        +1 (555) 123-4567
                      </p>
                    </section>
                  </div>
                </ScrollShadow>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  onClick={onClose}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Entendido
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};