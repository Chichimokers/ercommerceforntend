"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CustomButton } from "@/components/buttons/custom-button";
import { FaShoppingCart, FaArrowRight } from "react-icons/fa";

const EmptyCart = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gray-900 rounded-xl shadow-md text-center"
    >
      <div className="mb-6 relative">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
          className="bg-blue-100 dark:bg-blue-900 p-6 rounded-full"
        >
          <FaShoppingCart className="h-12 w-12 text-blue-500 dark:text-blue-300" />
        </motion.div>
        <motion.div
          animate={{
            scale: [0, 1.2, 1],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
          className="absolute -top-2 -right-2 bg-red-500 rounded-full h-6 w-6 flex items-center justify-center text-white text-xs font-bold"
        >
          0
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
        Tu carrito está vacío
      </h2>

      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        Parece que aún no has agregado ningún producto a tu carrito. Explora nuestro catálogo para encontrar lo que necesitas.
      </p>

      <Link href="/products">
        <CustomButton
          variant="filled"
          className="flex items-center gap-2 px-6 py-3 text-base"
        >
          Ver productos
          <FaArrowRight className="h-4 w-4" />
        </CustomButton>
      </Link>
    </motion.div>
  );
};

export default EmptyCart;