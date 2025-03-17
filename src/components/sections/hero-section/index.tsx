import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { FiInfo, FiShoppingCart } from "react-icons/fi";
import FeatureItem from "./feature-item";

const HeroButtons = dynamic(() => import("./client/hero-buttons"), {
  loading: () => <ButtonsFallback />
});

const LocationHandler = dynamic(() => import("./client/location-handler"));

const AnimationEffects = dynamic(() => import("./client/animation-effects"));

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      <LocationHandler>
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-100/20 dark:bg-blue-900/5"
          />
          <div
            className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-purple-100/10 dark:bg-purple-900/5"
          />
        </div>

        <section className="relative w-full min-h-[600px] h-auto md:h-[700px] lg:h-[800px] flex flex-col items-center justify-center text-center overflow-hidden bg-gradient-to-b from-black/70 via-black/50 to-blue-50 dark:to-black/70 py-8 md:py-0">
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/banner-principal.webp"
              alt="Es Aki - E-commerce cubano"
              fill
              quality={50}
              priority
              className="object-cover opacity-60 dark:opacity-50"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black to-black/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/50" />
          </div>

          <div className="absolute top-1/4 -left-20 w-[40rem] h-[40rem] rounded-full bg-blue-600/10 blur-3xl z-0"></div>
          <div className="absolute bottom-0 -right-20 w-[30rem] h-[30rem] rounded-full bg-indigo-600/10 blur-3xl z-0"></div>

          <div className="relative z-20 px-6 sm:px-10 py-10 sm:py-16 w-full max-w-7xl mx-auto flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-4 sm:mb-6">
              ¡Bienvenido a <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Es Aki!</span>
            </h1>

            <div className="max-w-2xl mx-auto">
              <p className="text-lg sm:text-xl md:text-2xl text-gray-100 mb-6 sm:mb-8 drop-shadow-lg leading-relaxed">
                Descubre los mejores productos con entrega rápida en Cuba.
                <span className="hidden md:inline"> Conectando familias a través del comercio digital.</span>
              </p>
            </div>

            <div className="w-full max-w-4xl mx-auto pb-4 sm:pb-8 px-2 sm:px-0">
              <div className="bg-white/10 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-white/20 shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <FeatureItem
                    icon={<FiShoppingCart className="text-lg sm:text-xl text-blue-300" />}
                    bgColor="bg-blue-500/20"
                    title="Productos Selectos"
                    description="La mejor selección para tus seres queridos"
                  />

                  <FeatureItem
                    icon={
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    }
                    bgColor="bg-indigo-500/20"
                    title="Envío Rápido"
                    description="Llegamos a toda Cuba con rapidez"
                  />

                  <FeatureItem
                    icon={
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    }
                    bgColor="bg-green-500/20"
                    title="100% Garantizado"
                    description="Compromiso de calidad y satisfacción"
                  />
                </div>

                {/* Botones - reemplazados por componente cliente */}
                <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <HeroButtons />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-900 to-transparent z-10"></div>
        </section>

        {/* Efectos visuales adicionales */}
        <AnimationEffects />
      </LocationHandler>
    </div>
  );
}

// Fallback para botones mientras se cargan
function ButtonsFallback() {
  return (
    <>
      <div className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-medium shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base">
        <FiShoppingCart className="text-lg" />
        <span>Explorar Productos</span>
      </div>

      <Link href="/about" className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white border border-white/30 px-6 py-2.5 sm:py-3 rounded-full font-medium flex items-center justify-center gap-2 text-sm sm:text-base">
        <FiInfo className="text-lg" />
        <span>Conocer más</span>
      </Link>
    </>
  );
}