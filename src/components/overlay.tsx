import { motion } from "framer-motion";
import { createPortal } from "react-dom";

export const Overlay = ({ onClick }: { onClick: () => void }) => {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
      onClick={onClick}
    />,
    document.body
  );
};