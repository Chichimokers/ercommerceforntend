import { Card, CardBody } from "@heroui/react";
import React from "react";
import Link from "next/link";

const CategoryCard = ({
  className,
  size,
  icon,
  text,
  url,
}: {
  className?: string;
  size: string;
  icon: React.ReactNode;
  text: string;
  url: string;
}) => {
  return (
    <Card
      isHoverable
      isPressable
      className={`relative overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl ${className}`}
      shadow="md"
      as={Link}
      href={url}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardBody className="p-4">
        <div className="flex flex-col justify-center items-center h-full gap-3">
          <div className={`mb-1 transition-transform ${size === "lg" ? "text-4xl" : "text-3xl"}`}>
            {icon}
          </div>
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {text}
          </h4>
        </div>
      </CardBody>
    </Card>
  );
};

export default CategoryCard;
