'use client';

import { AnimatePresence, motion } from "framer-motion";

// Exportar los componentes individualmente
export { AnimatePresence, motion };

// También exportar como un objeto para importación dinámica
const FramerComponents = {
  AnimatePresence,
  motion
};

export default FramerComponents;
