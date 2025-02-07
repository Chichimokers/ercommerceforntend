"use client";

import { QRCodeCanvas } from "qrcode.react"; // Asegúrate de instalar qrcode.react
import { useTheme } from "next-themes";

const CustomQRCode = ({ value }: { value: string }) => {
  const { theme } = useTheme(); // Detecta el tema actual
  const isDark = theme === "dark";

  return (
    <div
      className="relative flex justify-center items-center p-2 rounded-2xl transition-all duration-300 hover:scale-[1.02] group"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #1a1a1a, #2d2d2d)"
          : "linear-gradient(135deg, #f6f6f6, #e0e0e0)",
        border: "3px solid",
        borderColor: isDark ? "#3a3a3a" : "#e5e5e5",
      }}
    >
      {/* Efecto de brillo dinámico */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -inset-[100%] animate-spin-slow [background:linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] opacity-20 group-hover:opacity-30 transition-opacity"
          style={{ mixBlendMode: isDark ? 'screen' : 'overlay' }} />
      </div>

      {/* Marco interno sutil */}
      <div className="absolute rounded-xl border"
        style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />

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

      {/* Efecto de borde degradado */}
      <div className="absolute -inset-0.5 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${isDark ? '#40404000 20%, #80808080 50%, #40404000 80%' : '#e5e5e500 20%, #ffffff80 50%, #e5e5e500 80%'})`,
          filter: 'blur(8px)'
        }} />
    </div>
  );
};

export default CustomQRCode;
