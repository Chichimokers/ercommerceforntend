"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] flex flex-col items-center justify-center text-center bg-black">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/banner-principal.webp"
          alt="Es Aki - E-commerce cubano"
          layout="fill"
          objectFit="cover"
          quality={60}
          priority
          className="absolute inset-0 w-full h-full opacity-50 dark:opacity-40"
        />
        {/* Degradado al final */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 px-8 py-12 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
          ¡Bienvenido a <span className="text-blue-300">Es Aki!</span>
        </h1>
        <p className="text-lg md:text-xl mt-4 text-gray-200 drop-shadow-md">
          Descubre los mejores productos con entrega rápida en Cuba.
        </p>
        {/* Botón de exploración */}
        <div className="mt-6">
          <Link href="/products">
            <span className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:bg-blue-100 transition-all duration-300 cursor-pointer">
              Explorar Productos
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
