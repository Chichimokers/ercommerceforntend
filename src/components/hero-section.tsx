"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center text-center bg-black">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/banner-principal.png"
          alt="Es Aki - E-commerce cubano"
          layout="fill"
          objectFit="cover"
          priority
          className="absolute inset-0 w-full h-full opacity-30"
        />
        {/* Capa de degradado para desvanecimiento */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-50 dark:from-gray-900 to-transparent" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 text-white p-6 rounded-3xl">
        <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
          ¡Bienvenido a Es Aki!
        </h1>
        <p className="text-lg md:text-xl mt-4 mb-8 drop-shadow-lg">
          Descubre los mejores productos con entrega rápida en Cuba.
        </p>
        <Link href="/products">
          <span className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition-colors cursor-pointer">
            Explorar Productos
          </span>
        </Link>
      </div>
    </section>
  );
}
