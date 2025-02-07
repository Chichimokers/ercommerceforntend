import { FaXmark } from "react-icons/fa6";

type DeleteItemButtonProps = {
  onPress?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

export function DeleteItemButton({ onPress, className }: DeleteItemButtonProps) {
  return (
    <button
      aria-label="Remove cart item"
      onClick={onPress}
      className={`${className} flex h-[24px] w-[24px] items-center justify-center rounded-full bg-neutral-500`}
      type="button"
    >
      <FaXmark className="mx-[1px] h-4 w-4 text-white dark:text-black" />
    </button>
  );
}
