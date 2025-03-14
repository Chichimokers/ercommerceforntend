"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useTheme } from "next-themes";

const CustomQRCode = ({ value }: { value: string }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="relative flex justify-center items-center group bg-white"
    >

      <QRCodeCanvas
        value={value}
        size={96}
        bgColor="transparent"

        level="H"
      />
    </div>
  );
};

export default CustomQRCode;
