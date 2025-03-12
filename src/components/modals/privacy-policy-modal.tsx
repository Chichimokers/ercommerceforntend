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

export const PrivacyPolicyModal = () => {
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
        Política de Privacidad
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
                  Política de Privacidad
                </h2>
                <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  Última actualización: 10 de marzo de 2025
                </p>
              </ModalHeader>
              <ModalBody>
                <ScrollShadow className="h-[60vh] pr-4">
                  <div className="space-y-6 text-gray-700 dark:text-gray-300">
                    <section>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">1. Información que recopilamos</h3>
                      <p>
                        En EsAki, valoramos su privacidad y nos comprometemos a proteger sus datos personales.
                        Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos su información cuando utiliza nuestro servicio.
                      </p>
                      <p className="mt-2">Recopilamos varios tipos de información, que incluyen:</p>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li><strong>Información personal</strong>: nombre, dirección de correo electrónico, dirección postal, número de teléfono, etc.</li>
                        <li><strong>Información de pago</strong>: datos de tarjetas de crédito, información de facturación, etc.</li>
                        <li><strong>Información de uso</strong>: cómo interactúa con nuestro sitio, productos que ve, páginas visitadas, etc.</li>
                        <li><strong>Información del dispositivo</strong>: dirección IP, tipo de navegador, proveedor de servicios de Internet, etc.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">2. Cómo utilizamos su información</h3>
                      <p>Utilizamos la información recopilada para:</p>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Procesar y completar sus pedidos</li>
                        <li>Enviar confirmaciones de pedido y actualizaciones</li>
                        <li>Responder a sus preguntas y solicitudes</li>
                        <li>Mejorar nuestros productos y servicios</li>
                        <li>Personalizar su experiencia en nuestro sitio</li>
                        <li>Enviar información sobre ofertas y promociones (con su consentimiento)</li>
                        <li>Detectar y prevenir actividades fraudulentas</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">3. Compartir información</h3>
                      <p>
                        No vendemos ni alquilamos su información personal a terceros. Sin embargo, podemos compartir su información con:
                      </p>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Proveedores de servicios que nos ayudan a operar nuestro negocio (procesamiento de pagos, envíos, etc.)</li>
                        <li>Socios logísticos para la entrega de productos en Cuba</li>
                        <li>Autoridades legales cuando sea requerido por ley</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">4. Seguridad de datos</h3>
                      <p>
                        Implementamos medidas de seguridad adecuadas para proteger su información personal contra acceso, alteración,
                        divulgación o destrucción no autorizados. Estas medidas incluyen cifrado de datos, firewalls y protocolos
                        de seguridad avanzados.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">5. Cookies y tecnologías similares</h3>
                      <p>
                        Utilizamos cookies y tecnologías similares para mejorar su experiencia, analizar tendencias y administrar
                        el sitio. Puede controlar el uso de cookies a través de la configuración de su navegador.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">6. Sus derechos</h3>
                      <p>Según las leyes de protección de datos, usted tiene derecho a:</p>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Acceder a su información personal</li>
                        <li>Corregir información inexacta</li>
                        <li>Eliminar su información personal</li>
                        <li>Oponerse al procesamiento de sus datos</li>
                        <li>Retirar el consentimiento en cualquier momento</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">7. Cambios a esta política</h3>
                      <p>
                        Podemos actualizar nuestra Política de Privacidad ocasionalmente. Le notificaremos cualquier cambio
                        publicando la nueva Política de Privacidad en esta página y, si los cambios son significativos,
                        le enviaremos una notificación por correo electrónico.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">8. Contacto</h3>
                      <p>
                        Si tiene preguntas sobre esta Política de Privacidad, por favor contáctenos en:
                      </p>
                      <p className="mt-2 font-medium">
                        privacidad@esaki-jrr.com<br />
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