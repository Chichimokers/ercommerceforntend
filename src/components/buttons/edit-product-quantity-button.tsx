import { FaMinus, FaPlus } from "react-icons/fa";
import React, { MouseEventHandler } from "react";

export const EditProductQuantityButton = React.memo(
  ({
    type,
    onClick,
  }: {
    type: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
  }) => {
    const isPlus = type === "plus";

    return (
      <button
        aria-label={isPlus ? "Increase item quantity" : "Reduce item quantity"}
        onClick={onClick}
        className={`
          flex items-center justify-center 
          w-8 xxs:w-10 h-full 
          max-w-[50px] 
          active:bg-default-300
          ${isPlus ? "rounded-r-full" : "rounded-l-full"}
          bg-transparent text-current hover:bg-default-100
          transition-all duration-300
        `}
      >
        {isPlus ? <FaPlus size={16} /> : <FaMinus size={12} />}
      </button>
    );
  }
);

EditProductQuantityButton.displayName = "EditProductQuantityButton";
