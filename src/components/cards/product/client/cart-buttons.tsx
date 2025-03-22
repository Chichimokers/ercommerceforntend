// src/components/cards/product/client/cart-buttons.tsx
"use client";

import { CustomButton } from "@/components/buttons/custom-button";
import { FaBucket } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";
import { ProductBase } from "@/types/types";
import { memo } from "react";
import { Tooltip } from "@heroui/react";

interface CartButtonsProps {
  product: ProductBase;
  isInCart: boolean;
  handleAddToCart: () => void;
  handleRemoveFromCart: () => void;
  isMobile: boolean;
}

export const CartButtons = memo(function CartButtons({
  product,
  isInCart,
  handleAddToCart,
  handleRemoveFromCart,
  isMobile,
}: CartButtonsProps) {
  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };

  if (isInCart) {
    return <RemoveFromCartButton
      onClick={(e) => handleButtonClick(e, handleRemoveFromCart)}
      product={product}
      isMobile={isMobile}
    />;
  } else {
    return <AddToCartButton
      onClick={(e) => handleButtonClick(e, handleAddToCart)}
      disabled={product.quantity === 0}
      isMobile={isMobile}
    />;
  }
});

function AddToCartButton({
  onClick,
  disabled = false,
  isMobile = false,
}: {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  isMobile?: boolean;
}) {
  const button = (
    <div className="w-full">
      <CustomButton
        className={`
          h-9 w-full !p-0 
          ${isMobile ? "" : "hover:shadow-lg active:scale-95"} 
          ${isMobile ? "transition-opacity" : "transition-all"} duration-200 
          rounded-xl ${disabled ? "opacity-60 cursor-not-allowed" : ""} 
          touch-action-pan-y
        `}
        onClick={onClick}
        isDisabled={disabled}
        aria-label="Añadir al carrito"
      >
        <FaShoppingCart className="h-4 w-4" />
      </CustomButton>
    </div>
  );

  if (isMobile) return button;

  return (
    <Tooltip content={disabled ? "Sin stock disponible" : "Añadir al carrito"}>
      {button}
    </Tooltip>
  );
}

function RemoveFromCartButton({
  onClick,
  product,
  isMobile = false,
}: {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  product: ProductBase;
  isMobile?: boolean;
}) {
  const button = (
    <div className="w-full">
      <CustomButton
        className={`h-9 w-full !p-0 
                  ${isMobile ? "" : "hover:shadow-lg active:scale-95"} 
                  ${isMobile ? "transition-colors" : "transition-all"} duration-200 rounded-xl 
                  bg-red-500 hover:bg-red-600 touch-action-pan-y`}
        color="danger"
        onClick={onClick}
        aria-label={`Eliminar ${product.name} del carrito`}
      >
        <FaBucket className="h-4 w-4" />
      </CustomButton>
    </div>
  );

  if (isMobile) return button;

  return (
    <Tooltip content={`Eliminar ${product.name} del carrito`}>
      {button}
    </Tooltip>
  );
}