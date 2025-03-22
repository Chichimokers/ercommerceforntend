import React, { useEffect, useState } from "react";
import { Modal, ModalContent, Spinner } from "@heroui/react";

type SpinnerColor =
  | "primary"
  | "current"
  | "white"
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

const LoadingModal = ({
  isOpen = true,
  message = "Cargando...",
  spinnerColor = "primary",
  onClose,
}: {
  isOpen: boolean;
  message?: string;
  spinnerColor?: SpinnerColor;
  onClose?: () => void;
}) => {
  const [show, setShow] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        if (onClose) onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Modal
      isOpen={show}
      hideCloseButton
      placement="center"
      isDismissable={false}
      backdrop="opaque"
      classNames={{
        base: "bg-transparent shadow-none",
        wrapper: "bg-transparent",
      }}
    >
      <ModalContent className="p-8">
        <div className="flex flex-col items-center gap-4">
          <Spinner label={message} color={spinnerColor} size="md" />
        </div>
      </ModalContent>
    </Modal>
  );
};

export default LoadingModal;
