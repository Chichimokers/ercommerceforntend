import { InputOtp } from "@heroui/react";
import React from "react";

const VerificationCard = () => {
  const [value, setValue] = React.useState("");

  return (
    <>
      <div className="w-full flex flex-col gap-4">
        <InputOtp length={4} size="lg" value={value} onValueChange={setValue} />
      </div>
      <style jsx>{`
        .custom-otp input {
          margin-right: 16px; /* Ajusta el espacio horizontal */
        }
      `}</style>
    </>
  );
};

export default VerificationCard;
