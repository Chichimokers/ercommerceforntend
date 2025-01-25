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
      <span className="transform group-hover:scale-110 transition-transform duration-200 text-primary">
        {icon}
      </span>
      <span className="text-sm font-medium">{profile}</span>
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
            <h2 className="text-lg font-bold text-foreground/90 pb-2 border-b-2 border-primary/20 inline-block">
              Sobre nosotros
            </h2>
            <p className="text-default-600 text-sm leading-relaxed prose dark:prose-invert">
              Somos una plataforma líder de comercio electrónico que proporciona
              una amplia gama de productos para satisfacer todas sus
              necesidades.Nuestra misión es entregar Productos de calidad a los
              mejores precios.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground/90 pb-2 border-b-2 border-primary/20 inline-block">
              Servicio al cliente
            </h2>
            <ul className="space-y-3">
              <CustomerService href={"#"} value={"Contactanos"} />
              <CustomerService href={"#"} value={"Devolución"} />
              <CustomerService href={"#"} value={"Envío"} />
              <CustomerService href={"#"} value={"Preguntas frecuentes"} />
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground/90 pb-2 border-b-2 border-primary/20 inline-block">
              Síguenos
            </h2>
            <div className="flex flex-col space-y-3">
              <SocialMedia
                href={"#"}
                icon={<FaFacebook size={18} />}
                profile={"facebook.com/esaki"}
              />
              <SocialMedia
                href={"#"}
                icon={<FaTwitter size={18} />}
                profile={"twitter.com/esaki"}
              />
              <SocialMedia
                href={"#"}
                icon={<FaInstagram size={18} />}
                profile={"instagram.com/esaki"}
              />
              <SocialMedia
                href={"#"}
                icon={<FaLinkedinIn size={18} />}
                profile={"linkedin.com/esaki"}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-left items-start text-foreground/90 pb-2 border-b-2  border-primary/20 inline-block">
              Aceptamos
            </h2>
            <div className="flex justify-start space-x-2">
              <Image
                src="/icons/visa.svg"
                alt="visa"
                width={45}
                height={45}
                className="opacity-90 hover:opacity-100 transition-all duration-200 hover:scale-105"
              />
              <Image
                src="/icons/mastercard.svg"
                alt="mastercard"
                width={45}
                height={45}
                className="opacity-90 hover:opacity-100 transition-all duration-200 hover:scale-105"
              />
              <Image
                src="/icons/paypal.svg"
                alt="paypal"
                width={45}
                height={45}
                className="opacity-90 hover:opacity-100 transition-all duration-200 hover:scale-105"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-default-200">
          <div className="text-center space-y-4">
            <p className="text-default-500 text-sm">
              &copy; {new Date().getFullYear()} EsAki. Todos los derechos
              reservados.
            </p>
            <div className="text-xs text-default-400">
              Diseñado con ❤️ para una mejor experiencia de compra
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
