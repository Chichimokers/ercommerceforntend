// src/components/captcha-modal.tsx
import React, { useRef, useState, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { motion } from 'framer-motion';
import { Loader, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

interface CaptchaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (token: string) => void;
}

const CaptchaModal: React.FC<CaptchaModalProps> = ({ isOpen, onClose, onVerify }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(Date.now()); // Clave para forzar re-renderizado
  const captchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    // Al abrir el modal, resetear estados
    if (isOpen) {
      setError(null);
      setIsVerifying(false);
      setCaptchaKey(Date.now());
    }
  }, [isOpen]);

  const handleVerify = async (token: string | null) => {
    if (!token) {
      setError('Por favor, completa el captcha');
      return;
    }

    // Mostrar primeros 10 caracteres del token para depuración
    console.log(`Token recibido: ${token.substring(0, 10)}...`);

    // Evitar múltiples verificaciones
    if (isVerifying) return;

    setError(null);
    setIsVerifying(true);

    try {
      onVerify(token);
    } catch (err) {
      console.error('Error en verificación CAPTCHA:', err);
      setError('Error de conexión. Intenta nuevamente.');
      handleReset();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    // Prevenir reset durante verificación
    if (isVerifying) return;

    // Generar nueva clave para forzar reinicio completo del componente
    setCaptchaKey(Date.now());
    setError(null);

    // Asegurar que el captcha se reinicia completamente
    setTimeout(() => {
      if (captchaRef.current) {
        captchaRef.current.reset();
      }
    }, 50);
  };

  const handleCancel = () => {
    if (!isVerifying) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white text-center flex items-center justify-center gap-2">
            <ShieldCheck className="text-primary" size={24} />
            Verificación de seguridad
          </h3>
        </div>

        <div className="p-5">
          <p className="text-gray-600 dark:text-gray-300 mb-5 text-center">
            Esta verificación ayuda a proteger nuestro sitio del spam y abuso.
          </p>

          <div className="flex justify-center mb-4">
            {/*@ts-ignore*/}
            <ReCAPTCHA
              key={captchaKey}
              ref={captchaRef}
              // Usar clave de prueba como fallback - siempre funciona
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
              onChange={(token) => {
                // Añadir console.log para debug
                console.log("Token recibido:", token ? token.substring(0, 10) + "..." : "null");
                handleVerify(token);
              }}
              theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
              size="normal"
              hl="es"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3 p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
          <button
            onClick={handleCancel}
            disabled={isVerifying}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>

          <button
            onClick={handleReset}
            disabled={isVerifying}
            className="px-4 py-2 text-sm font-medium flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
          >
            <RefreshCw size={14} className={isVerifying ? 'animate-spin' : ''} />
            Nuevo captcha
          </button>
        </div>

        {isVerifying && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader size={40} className="animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-gray-700 dark:text-gray-300 font-medium">Verificando...</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CaptchaModal;