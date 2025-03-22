import { Chip } from "@heroui/react";

export default function StockBadge({ quantity }: { quantity: number }) {
  if (quantity === 0) {
    return (
      <Chip color="danger" size="sm" className="absolute bottom-2 left-2">
        Agotado
      </Chip>
    );
  }

  if (quantity === 1) {
    return (
      <Chip color="danger" size="sm" className="absolute bottom-2 left-2">
        Última unidad
      </Chip>
    );
  }

  if (quantity < 5) {
    return (
      <Chip color="warning" size="sm" className="absolute bottom-2 left-2">
        Solo {quantity} unidades
      </Chip>
    );
  }

  return null;
}