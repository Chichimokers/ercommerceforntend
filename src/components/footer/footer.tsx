import Link from "next/link";
import Image from "next/image";
import { TermsModal } from "@components/modals/terms-modal";
import { PrivacyPolicyModal } from "@components/modals/privacy-policy-modal";
import { MastercardIcon, PaypalIcon, VisaIcon } from "@components/icons/icons";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and about */}
          <div>
            <div className="mb-4">
              <Image
                src="/logonav.png"
                alt="EsAki Logo"
                width={120}
                height={36}
                className="object-contain"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Plataforma de comercio electrónico que conecta a las familias con sus seres queridos en Cuba.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Explorar</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer">
                  <TermsModal />
                </span>
              </li>
              <li>
                <span className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer">
                  <PrivacyPolicyModal />
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-500 dark:text-gray-400">
                contacto@esaki-jrr.com
              </li>
              <li className="text-sm text-gray-500 dark:text-gray-400">
                +52 (555) 123-4567
              </li>
            </ul>

            {/* Social media */}
            <div className="mt-4 flex space-x-4">
              <a href="https://facebook.com/esaki" target="_blank" rel="noreferrer" aria-label="Facebook"
                className="text-gray-400 hover:text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://twitter.com/esaki" target="_blank" rel="noreferrer" aria-label="Twitter"
                className="text-gray-400 hover:text-blue-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="https://instagram.com/esaki" target="_blank" rel="noreferrer" aria-label="Instagram"
                className="text-gray-400 hover:text-pink-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://linkedin.com/company/esaki" target="_blank" rel="noreferrer" aria-label="LinkedIn"
                className="text-gray-400 hover:text-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4">
            <VisaIcon width={40} height={40} />
            <MastercardIcon width={40} height={40} />
            <PaypalIcon width={40} height={40} />
          </div>

          <div className="mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
            &copy; {currentYear} EsAki. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
