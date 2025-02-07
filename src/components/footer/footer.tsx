import { FaFacebook } from "react-icons/fa";
import { FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import Link from "next/link";

import React from "react";
import Image from "next/image";

const SocialMedia = ({
  href,
  icon,
  profile,
}: {
  href: string;
  icon: React.ReactNode;
  profile: string;
}) => {
  return (
    <Link
      href={href}
      className="text-default-700 hover:text-primary-600 transition-all duration-200 flex items-center gap-2 group"
    >
      <span className="transform group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-200 text-primary">
        {icon}
      </span>
      <span className="text-sm font-medium group-hover:underline decoration-wavy decoration-primary/40 underline-offset-4">
        {profile}
      </span>
    </Link>
  );
};

const CustomerService = ({ href, value }: { href: string; value: string }) => {
  return (
    <li className="mb-2">
      <a
        href={href}
        className="text-default-700 hover:text-primary-600 transition-all duration-200 text-sm font-medium hover:translate-x-1 inline-block"
      >
        {value}
      </a>
    </li>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-background to-default-50 border-t border-default-200">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground/90 pb-2 border-b-2 border-primary/20 inline-block relative after:absolute after:bottom-0 after:left-0 after:w-1/3 after:h-0.5 after:bg-gradient-to-r after:from-primary/70 after:to-transparent">
              Sobre nosotros
            </h2>
            <p className="text-default-600 text-sm leading-relaxed prose dark:prose-invert mb-4">
              Somos una plataforma líder de comercio electrónico que proporciona
              una amplia gama de productos para satisfacer todas sus
              necesidades. Nuestra misión es entregar productos de calidad a los
              mejores precios.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground/90 pb-2 border-b-2 border-primary/20 inline-block relative after:absolute after:bottom-0 after:left-0 after:w-1/3 after:h-0.5 after:bg-gradient-to-r after:from-primary/70 after:to-transparent">
              Servicio al cliente
            </h2>
            <ul className="space-y-3">
              <CustomerService href={"/contacto"} value={"Contacto 24/7"} />
              <CustomerService href={"/devoluciones"} value={"Devoluciones rápidas"} />
              <CustomerService href={"/envios"} value={"Envío express"} />
              <CustomerService href={"/faq"} value={"Preguntas frecuentes"} />
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground/90 pb-2 border-b-2 border-primary/20 inline-block relative after:absolute after:bottom-0 after:left-0 after:w-1/3 after:h-0.5 after:bg-gradient-to-r after:from-primary/70 after:to-transparent">
              Síguenos
            </h2>
            <div className="flex flex-col space-y-3">
              <SocialMedia
                href={"https://facebook.com/esaki"}
                icon={<FaFacebook size={20} />}
                profile={"@esaki_ok"}
              />
              <SocialMedia
                href={"https://twitter.com/esaki"}
                icon={<FaTwitter size={20} />}
                profile={"@esaki_tweets"}
              />
              <SocialMedia
                href={"https://instagram.com/esaki"}
                icon={<FaInstagram size={20} />}
                profile={"@esaki_style"}
              />
              <SocialMedia
                href={"https://linkedin.com/esaki"}
                icon={<FaLinkedinIn size={20} />}
                profile={"Esaki Careers"}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground/90 pb-2 border-b-2 border-primary/20 inline-block relative after:absolute after:bottom-0 after:left-0 after:w-1/3 after:from-primary/70 after:to-transparent">
              Aceptamos
            </h2>
            <div className="grid grid-cols-4">
              {['visa', 'mastercard', 'paypal'].map((icon) => (
                <div key={icon} className="rounded-lg transition-colors w-[60] h-[40]">
                  <Image
                    src={`/icons/${icon}.svg`}
                    alt={icon}
                    width={60}
                    height={40}
                    className="opacity-90 hover:opacity-100 transition-all duration-200 hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-default-200">
          <div className="text-center space-y-4">
            <p className="text-default-500 text-sm">
              &copy; {new Date().getFullYear()} EsAki. Todos los derechos reservados.
              <a href="/terminos" className="ml-2 hover:text-primary-600 transition-colors">Términos y condiciones</a>
            </p>
            <div className="text-xs text-default-400 flex items-center justify-center space-x-2">
              <span>Diseñado con</span>
              <span className="text-red-500 animate-pulse">❤️</span>
              <span>para una mejor experiencia de compra</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
