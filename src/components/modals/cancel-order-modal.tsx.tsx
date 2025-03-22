import { motion } from "framer-motion";
import { X } from "lucide-react";
import { CustomButton } from "@components/buttons/custom-button";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
}: CancelOrderModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <motion.div
        className="relative w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold">Cancelar Orden</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          ¿Estás seguro de que deseas cancelar esta orden? Esta acción no se
          puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <CustomButton className="bg-transparent hover:bg-default-200" onClick={onClose}>
            Mantener Orden
          </CustomButton>
          <CustomButton color="danger" onClick={onConfirm}>
            Cancelar Orden
          </CustomButton>
        </div>
      </motion.div>
    </div>
  );
}
