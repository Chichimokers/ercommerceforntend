"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useTheme } from "next-themes";

const CustomQRCode = ({ value }: { value: string }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="relative flex justify-center items-center p-2 rounded-2xl transition-all duration-300 hover:scale-[1.02] group"
      style={{
        background: isDark ? "#1f2937" : "#f3f4f6",
        border: "3px solid",
        borderColor: isDark ? "#3a3a3a" : "#e5e5e5",
      }}
    >

      <QRCodeCanvas
        value={value}
        size={96}  // Tamaño aumentado
        bgColor="transparent"
        fgColor={isDark ? "#e5e5e5" : "#2d2d2d"}
        level="H"  // Mayor corrección de errores
        imageSettings={{
          src: isDark
            ? '/logo-qr-dark.svg'  // Logo para tema oscuro
            : '/logo-qr-light.svg', // Logo para tema claro
          height: 24,
          width: 24,
          excavate: true,
        }}
      />
    </div>
  );
};

export default CustomQRCode;
