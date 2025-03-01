import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import { Badge } from "@heroui/react";
import { useContext } from "react";
import React from "react";
import { CartContext } from "@/contexts/cart-context";

const IconButton = React.memo(({ className }: { className?: string }) => {
  const { cart } = useContext(CartContext) || {};
  return (
    <Badge
      style={{ right: "6px", top: "6px" }}
      size="sm"
      color="danger"
      className={`w-5 h-5 shadow-lg border-2 text-[.6rem] text-white border-[#e4e4e7] dark:border-[#3f3f46]`}
      content={cart?.length ? cart.length.toString() : undefined}
      shape="circle"
      showOutline={false}
      isInvisible={!cart?.length}
    >
      <Link
        className={`${className} flex-col justify-center gap-4 items-center hover:border-default-400 w-10 h-10 rounded-full border-2 border-default-200`}
        href="/shopping-cart"
      >
        <FaShoppingCart opacity={0.7} size={22} />
      </Link>
    </Badge>
  );
});

IconButton.displayName = "IconButton";

export default IconButton;
