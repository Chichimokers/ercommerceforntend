import { ClipboardCheck, CreditCard, ListOrderedIcon } from "lucide-react";
import React from "react";

export const CheckoutStepper = ({ step_active }: { step_active: "place_order" | "order_placed" | "confirmed_payment" }) => {
  const timelineSteps = [
    {
      name: 'Realizar pedido',
      active: step_active === "place_order",
      icon: ListOrderedIcon
    },
    {
      name: 'Pedido realizado',
      active: step_active === "order_placed",
      icon: ClipboardCheck
    },
    {
      name: 'Pago confirmado',
      active: step_active === "confirmed_payment",
      icon: CreditCard
    },
  ];

  return (
    <div className="px-6 py-5 bg-gray-50 dark:bg-gray-900/30">
      <div className="flex items-center justify-between w-full">
        {timelineSteps.map((step, index) => (
          <React.Fragment key={step.name}>
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full
                            ${step.active
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
              >
                <step.icon className="w-5 h-5" />
              </div>
              <span className={`hidden sm:block text-xs mt-2 font-medium 
                          ${step.active
                  ? 'text-primary dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {step.name}
              </span>
            </div>

            {index < timelineSteps.length - 1 && (
              <div className="flex-1 h-1 mx-2">
                <div
                  className={`h-full ${step.active && timelineSteps[index + 1].active
                    ? 'bg-primary dark:bg-primary-400'
                    : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                ></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};