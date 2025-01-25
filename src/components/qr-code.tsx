"use client";

import { QRCodeCanvas } from "qrcode.react"; // Asegúrate de instalar qrcode.react
import { useTheme } from "next-themes";

const CustomQRCode = ({ value }: { value: string }) => {
  const { theme } = useTheme(); // Detecta el tema actual
  const isDark = theme === "dark";

  return (
    <div
      className="relative flex justify-center items-center p-2 rounded-xl shadow-lg hover:shadow-xl transition-transform hover:scale-105"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #232323, #434343)"
          : "linear-gradient(135deg, #f9f9f9, #e3e3e3)",
        border: "2px solid",
        borderColor: isDark ? "#444" : "#ddd",
      }}
    >
      {/* QR Code con logotipo central */}
      <QRCodeCanvas
        value={value}
        size={72}
        bgColor="transparent" // Fondo transparente para usar el degradado
        fgColor={isDark ? "#f9f9f9" : "#333"} // Color dinámico del código
        style={{ borderRadius: "8px" }} // Esquinas ligeramente redondeadas
      />
    </div>
  );
};

export default CustomQRCode;
