import { Card, CardBody } from "@heroui/react";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocation } from "@contexts/location-context";
import { motion } from "framer-motion";

interface CategoryCardProps {
  className?: string;
  size: string;
  icon: React.ReactNode;
  text: string;
  url: string;
  onLocationNeeded?: () => void;
  itemsCount?: number; // Nueva propiedad opcional para mostrar cantidad de items
}

const CategoryCard = ({
  className,
  size,
  icon,
  text,
  url,
  onLocationNeeded,
  itemsCount,
}: CategoryCardProps) => {
  const { location } = useLocation();
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    if (!location || !location.province || !location.municipality) {
      e.preventDefault();
      if (onLocationNeeded) {
        onLocationNeeded();
      }
    } else {
      router.push(url);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="h-full"
    >
      <Card
        isHoverable
        isPressable
        as={Link}
        href={url}
        onClick={handleCardClick}
        className={`relative overflow-hidden h-full group ${className}`}
        shadow="none"
      >
        {/* Fondo con gradiente interactivo */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/80 to-blue-50/40 dark:from-blue-900/20 dark:via-gray-800/80 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Brillo en hover */}
        <div className="absolute -inset-full h-[400%] w-[400%] opacity-0 group-hover:opacity-30 group-hover:animate-[spin_5s_linear_infinite] bg-gradient-conic from-blue-600 via-transparent to-blue-600 blur-xl" />

        <CardBody className="p-5 relative z-10">
          <div className="flex flex-col justify-center items-center h-full gap-3">
            {/* Icono con animación */}
            <div
              className={`relative ${size === "lg" ? "h-16 w-16" : "h-12 w-12"} flex items-center justify-center group-hover:scale-110 transition-all duration-500`}
            >
              <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-110 transition-all duration-500" />
              <div className="relative z-10 text-blue-600 dark:text-blue-400">
                {icon}
              </div>
            </div>

            {/* Texto de categoría */}
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {text}
            </h4>

            {/* Badge con contador de items (opcional) */}
            {itemsCount !== undefined && (
              <span className="absolute top-3 right-3 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded-full">
                {itemsCount}
              </span>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default CategoryCard;
