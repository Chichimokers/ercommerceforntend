"use client";

import React, { useContext } from "react";
import { Badge } from "@heroui/react";
import { ShoppingCart } from "lucide-react";
import { CartContext } from "@/contexts/cart-context";
import { CustomButton } from "./buttons/custom-button";
import { useCartStore } from "@store/cart/cart-store";

export default function CartCountBadge() {
  const { cart } = useCartStore();

  return (
    <div className="md:hidden">
      <Badge
        size="sm"
        className="w-6 h-6 shadow-lg border border-default-500 text-xs"
        content={cart?.length ? cart.length.toString() : undefined}
        shape="circle"
        color="danger"
        showOutline={false}
      >
        <CustomButton
          className="flex justify-center items-center w-10 h-10 rounded-full border-2 border-default-200 bg-opacity-50"
          color="default"
          variant="bordered"
          onClick={() => { }} // Puedes definir alguna acción, si la requieres
        >
          <ShoppingCart opacity={0.6} size={20} />
        </CustomButton>
      </Badge>
    </div>
  );
}
