import React, { useEffect } from "react";
import { Modal, Alert, ModalContent } from "@heroui/react";
import { FaXmark } from "react-icons/fa6";

interface UnSuccessModalProps {
  message?: string;
  isOpen: boolean;
  onClose: Function;
}

export default function UnSuccessModal({
  message,
  isOpen,
  onClose,
}: UnSuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Modal
      placement="center"
      backdrop="opaque"
      isOpen={isOpen}
      hideCloseButton
      style={{
        background: "transparent",
        boxShadow: "none",
        padding: "0",
        width: "auto",
        height: "auto",
      }}
    >
      <ModalContent className="bg-transparent">
        <div className="w-full flex items-center my-1">
          <Alert
            color="danger"
            variant="solid"
            description={message}
            icon={<FaXmark size={20} />}
          >
            {message}
          </Alert>
        </div>
      </ModalContent>
    </Modal>
  );
}
