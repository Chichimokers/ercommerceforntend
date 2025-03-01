"use client";
import React from "react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Bienvenido a Nuestra Tienda
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Descubre los mejores productos y ofertas exclusivas.
        </p>
        <Link href="/products" className="inline-block">
          <span className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition-colors cursor-pointer">
            Explorar Productos
          </span>
        </Link>
      </div>
    </section>
  );
}
