export default function StockBadge({ quantity }: { quantity: number }) {
  if (quantity === 0) {
    return (
      <div className="absolute bottom-2 left-2 text-xs z-10 bg-red-500 text-white px-2 py-1 rounded-full bg-opacity-90 backdrop-blur-sm">
        Agotado
      </div>
    );
  }

  if (quantity === 1) {
    return (
      <div className="absolute bottom-2 left-2 text-xs z-10 bg-red-500 text-white px-2 py-1 rounded-full bg-opacity-90 backdrop-blur-sm">
        Última unidad
      </div>
    );
  }

  if (quantity < 5) {
    return (
      <div className="absolute bottom-2 left-2 text-xs z-10 bg-amber-500 text-white px-2 py-1 rounded-full bg-opacity-90 backdrop-blur-sm">
        Solo {quantity} unidades
      </div>
    );
  }

  return null;
}