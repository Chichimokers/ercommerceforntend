"use client";
import React, { useState } from "react";

export default function NewsletterSubscription() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí puedes implementar la lógica para enviar el email a tu API de suscripción.
    setMessage("¡Gracias por suscribirte!");
    setEmail("");
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-default-900 dark:text-white mb-4">
          Suscríbete a nuestro boletín
        </h2>
        <p className="text-default-600 dark:text-gray-300 mb-8">
          Recibe las últimas noticias, ofertas y actualizaciones directamente en tu bandeja de entrada.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Tu correo electrónico"
            className="px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            Suscribirme
          </button>
        </form>
        {message && (
          <p className="mt-4 text-green-600 font-semibold">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
