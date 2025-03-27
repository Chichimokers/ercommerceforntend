import dynamic from "next/dynamic";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import FeatureItem from "./feature-item";

const HeroButtons = dynamic(() => import("./client/hero-buttons"));

const LocationHandler = dynamic(() => import("./client/location-handler"));

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      <LocationHandler>
        <section className="relative w-full min-h-[600px] h-auto md:h-[700px] lg:h-[800px] flex flex-col items-center justify-center text-center overflow-hidden py-8 md:py-0">

          <Image
            src="/bitmap.svg"
            alt="Es Aki - E-commerce cubano"
            fill
            className="object-cover"
          />

          <div className="absolute bottom-0 -right-20 w-[30rem] h-[30rem] rounded-full bg-indigo-600/10 blur-3xl z-0"></div>
          <div className="absolute bottom-0 left-0 h-16 bg-gradient from-transparent to-blue-50 dark:from-transparent dark:to-gray-900 z-0"></div>

          <div className="relative z-20 px-6 sm:px-10 py-10 sm:py-16 w-full max-w-7xl mx-auto flex flex-col items-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-4 sm:mb-6">
              ¡Bienvenido a <span className="bg-blue-400 bg-clip-text text-transparent">Es Aki!</span>
            </h1>

            <div className="max-w-2xl mx-auto">
              <p className="text-lg sm:text-xl md:text-2xl drop-shadow-sm mb-6 sm:mb-8 leading-relaxed">
                Descubre los mejores productos con entrega rápida en Cuba.
                <span className="hidden md:inline"> Conectando familias a través del comercio digital.</span>
              </p>
            </div>

            <div className="w-full max-w-4xl mx-auto pb-4 sm:pb-8 px-2 sm:px-0">
              <div className="bg-blue-50/70 dark:bg-gray-900/70 p-4 sm:p-6 md:p-8 rounded-2xl border border-white/20 dark:border-gray-800/50 shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <FeatureItem
                    icon={<ShoppingCart className="text-lg sm:text-xl text-blue-600 dark:text-blue-300" />}
                    bgColor="bg-blue-500/20"
                    title="Productos Selectos"
                    description="La mejor selección para tus seres queridos"
                  />

                  <FeatureItem
                    icon={
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    }
                    bgColor="bg-indigo-500/20"
                    title="Envío Rápido"
                    description="Llegamos a toda Cuba con rapidez"
                  />

                  <FeatureItem
                    icon={
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    }
                    bgColor="bg-green-500/20"
                    title="100% Garantizado"
                    description="Compromiso de calidad y satisfacción"
                  />
                </div>

                <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <HeroButtons />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent z-10"></div>
        </section>
      </LocationHandler>
    </div>
  );
}