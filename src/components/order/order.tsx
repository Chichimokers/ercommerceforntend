import Image from "next/image";
import { Order, Item } from "@/types/types";
import { Chip } from "@heroui-org/react";
import CustomQRCode from "../qr-code";
import { CustomButton } from "../buttons/custom-button";

const OrderItem = ({ item }: { item: Item }) => (
  <div className="flex items-center space-x-4 my-2">
    <Image
      alt={`Image of ${item.product.name}`}
      className="w-16 h-16 object-cover rounded-md shadow border border-default-200"
      height={100}
      src={item.product.image || "/nophoto.jpeg"}
      width={100}
      unoptimized
      loading="lazy"
    />
    <div>
      <h4 className="font-medium text-base">{item.product.name}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Cantidad: {item.quantity}
      </p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
        Precio: ${item.product.price.toFixed(2)}
      </p>
    </div>
  </div>
);

const OrderComponent = ({
  order,
  onCancelOrder,
}: {
  order: Order;
  onCancelOrder?: (orderId: string) => void;
}) => {
  return (
    <div
      className={
        "md:border md:rounded-xl md:overflow-hidden md:mb-4 md:border-default-200 md:bg-default-100 md:shadow-lg md:transition-all"
      }
    >
      {/* Contenedor principal con tamaño fijo */}
      <div className="h-[410px] max-h-[410px] flex flex-col overflow-hidden w-full">
        {/* Sección fija dentro del contenedor (ID, QR, Fecha, Estado) */}
        <div className="sticky top-0 z-10 px-4 pt-4">
          <div className="flex justify-between items-start min-w-[280]">
            <div>
              <h4 className="text-xl font-semibold">ID: {order.id}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Lugar: {order.province}
              </p>
              <Chip
                color={
                  order.status === "Enviada"
                    ? "primary"
                    : order.status === "Procesando"
                    ? "warning"
                    : "success"
                }
                variant="flat"
              >
                <span className={`font-medium`}>{order.status}</span>
              </Chip>
            </div>
            <CustomQRCode value={order.id} />
          </div>
        </div>

        <div className="border-b border-default-200 mt-4"></div>

        {/* Sección de productos desplazable */}
        <div className="overflow-y-auto flex-1 mt-2 px-4">
          {order.orderItems.map((item, index) => (
            <OrderItem key={index} item={item} />
          ))}
        </div>

        {/* Sección fija para precio total y botón */}
        <div className="sticky bottom-0 z-10 p-4">
          <p className="text-lg font-semibold mb-4">
            Total: ${order.subtotal.toFixed(2)}
          </p>
          <CustomButton
            color="danger"
            className="w-full"
            onClick={() => onCancelOrder?.(order.id)}
            isDisabled={order.status !== "Procesando"}
          >
            Cancelar Orden
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default OrderComponent;
