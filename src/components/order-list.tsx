import { Accordion, AccordionItem } from "@heroui/react";
import OrderComponent from "./order/order";
import { Order } from "@/types/types";

function OrderList({ orders: orders }: { orders: Order[] }) {
  return (
    <>
      <Accordion variant="splitted" className="flex md:hidden">
        {orders.map((order, index) => (
          <AccordionItem
            key={order.id}
            startContent={
              <div className="flex flex-col gap-1">
                <h4>Orden #{index + 1}</h4>
                <small
                  className={`font-medium text-start ${
                    order.status === "Enviada"
                      ? "text-blue-500"
                      : order.status === "Procesando"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {order.status}
                </small>
              </div>
            }
          >
            <OrderComponent order={order} />
          </AccordionItem>
        ))}
      </Accordion>

      <div className="md:grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 hidden">
        {orders.map((order) => (
          <OrderComponent key={order.id} order={order} />
        ))}
      </div>
    </>
  );
}

export default OrderList;
