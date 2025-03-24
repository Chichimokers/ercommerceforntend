"use client";

import React from "react";
import { Phone, Mail, Headset } from "lucide-react";
import CurrencySelector from "@components/selects/currency-selector";
import Link from "next/link";

const InfoItem = ({ icon, href, children, className = "" }: {
  icon: React.ReactNode;
  href?: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const content = (
    <div className={`flex items-center gap-2 group ${className}`}>
      <div className="text-primary-500 transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <span className="font-medium text-gray-600 dark:text-gray-300 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
        {children}
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
};

const InfoBar = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`bg-white/95 dark:bg-gray-900/95 border-b border-gray-200/50 dark:border-gray-700/50 
                  text-gray-700 dark:text-gray-300 py-2 px-4 shadow-sm ${className}`}
    >
      <div className="container mx-auto flex justify-between items-center text-sm">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          <InfoItem icon={<Phone size={14} />} href={`tel:${process.env.NEXT_PUBLIC_PHONE || "+535 0939062"}`}>
            {process.env.NEXT_PUBLIC_PHONE}
          </InfoItem>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block" />

          <InfoItem
            icon={<Mail size={14} />}
            href={`mailto:${process.env.NEXT_PUBLIC_EMAIL}`}
            className="hidden sm:flex"
          >
            {process.env.NEXT_PUBLIC_EMAIL || "ayudaesaki@gmail.com"}
          </InfoItem>

          {/*<div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1 hidden lg:block" />

          <InfoItem
            icon={<FaMapMarkerAlt size={14} />}
            href="/locations"
            className="hidden lg:flex"
          >
            Nuestras tiendas
          </InfoItem>*/}
        </div>

        <div className="flex items-center relative">
          <div className="w-48">
            <CurrencySelector />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoBar;
