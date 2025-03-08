import React from "react"
import { FaPhoneAlt, FaEnvelope, FaGlobe, FaMoneyBillWave } from "react-icons/fa"
import CurrencySelector from "@components/selects/currency-selector";
import Link from "next/link";

const InfoBar = ({ className }: { className?: string }) => {
  return (
    <div className="bg-neutral-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2 px-4 flex justify-between items-center text-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <FaPhoneAlt className="text-blue-600" />
          <span className="font-semibold">+34 900 123 456</span>
        </div>

        <div className="hidden sm:flex items-center space-x-2">
          <FaEnvelope className="text-blue-600" />
          <Link
            href="mailto:ayudaesaki@gmail.com"
            className="hover:text-blue-500 transition-colors"
          >
            ayudaesaki@gmail.com
          </Link>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 w-48">
          <CurrencySelector />
        </div>
      </div>
    </div>
  )
}

export default InfoBar
