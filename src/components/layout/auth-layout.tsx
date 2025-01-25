import React, { lazy, Suspense } from "react";
import { useModal } from "@/contexts/modal-context";
import { Modal, ModalContent, Spinner } from "@heroui/react";

// Lazy loading de modales
const Login = lazy(() => import("@/components/modals/login-modal"));
const SignUp = lazy(() => import("@/components/modals/signup-modal"));

// Componente de fallback para carga de modales
const ModalFallback = () => (
  <div className="flex justify-center items-center w-full h-full">
    <Spinner size="lg" color="primary" className="bg-transparent" />
  </div>
);

// Tipo para props de modal
interface ModalProps {
  title: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitch: () => void;
  closeModals: () => void;
}
//fuaaa la tiza mi loco
// Función genérica para renderizar modales
const renderModal = (
  ModalComponent: React.LazyExoticComponent<React.ComponentType<any>>,
  props: ModalProps,
  canRender: boolean
) => {
  const { isOpen, title, onOpenChange, onSwitch, closeModals } = props;
  return isOpen && canRender ? (
    <ModalComponent
      title={title}
      isOpen={isOpen} // Tipo para props de modal
      onOpenChange={onOpenChange}
      onSwitchToOther={onSwitch}
      closeModals={closeModals}
    />
  ) : isOpen ? (
    <ModalFallback />
  ) : null;
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isLoginOpen,
    isSignUpOpen,
    canRenderLogin,
    canRenderSignUp,
    closeModals,
    openLogin,
    openSignUp,
  } = useModal();

  return (
    <>
      {children}

      <Modal
        hideCloseButton={true}
        isOpen={isLoginOpen || isSignUpOpen}
        onOpenChange={(open) => {
          if (!open) closeModals();
        }}
        backdrop="blur"
        classNames={{
          base: "bg-transparent shadow-none",
          wrapper: "bg-transparent",
        }}
      >
        <ModalContent className="bg-transparent shadow-none border-none">
          <Suspense fallback={<ModalFallback />}>
            {renderModal(
              Login,
              {
                title: "Iniciar Sesion",
                isOpen: isLoginOpen,
                onOpenChange: (open) => {
                  if (!open) closeModals();
                },
                onSwitch: () => {
                  closeModals();
                  openSignUp();
                },
                closeModals,
              },
              canRenderLogin
            )}

            {renderModal(
              SignUp,
              {
                title: "Crear Cuenta",
                isOpen: isSignUpOpen,
                onOpenChange: (open) => {
                  if (!open) closeModals();
                },
                onSwitch: () => {
                  closeModals();
                  openLogin();
                },
                closeModals,
              },
              canRenderSignUp
            )}
          </Suspense>
        </ModalContent>
      </Modal>
    </>
  );
}
