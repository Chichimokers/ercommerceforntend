import { Portal } from "@components/ui/portal";
import { XIcon } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";

export const QRModal = ({
  isOpen,
  onClose,
  orderId,
  isMounted,
}: {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  isMounted: boolean;
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!isOpen || !isMounted) return;

    setShouldRender(true);
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflowY = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      window.scrollTo(0, scrollY);

      setTimeout(() => setShouldRender(false), 300);
    };
  }, [isOpen, isMounted]);

  if (!shouldRender) return null;

  const content = (
    <div
      className={`fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 
        ${isOpen && isMounted ? 'animate-fadeIn' : 'animate-fadeOut'}`}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl relative animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <XIcon size={20} />
        </button>

        <div className="text-center mb-4">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">QR de la orden</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Código #{orderId.slice(0, 6)}
          </p>
        </div>

        <div className="flex justify-center bg-white p-4 rounded-lg mb-4">
          <QRCodeCanvas
            value={orderId}
            size={280}
            bgColor="#FFFFFF"
            level="H"
            className="mx-auto"
          />
        </div>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          Acerca la cámara de tu dispositivo para escanear
        </p>
      </div>
    </div>
  );
  return <Portal>{content}</Portal>
};