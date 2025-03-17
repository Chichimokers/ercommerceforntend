import { ReactNode } from "react";

interface FeatureItemProps {
  icon: ReactNode;
  bgColor: string;
  title: string;
  description: string;
}

export default function FeatureItem({
  icon,
  bgColor,
  title,
  description
}: FeatureItemProps) {
  return (
    <div className="flex flex-row sm:flex-col items-center text-left sm:text-center p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-white/10 transition-all duration-300">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${bgColor} flex items-center justify-center mr-3 sm:mr-0 sm:mb-3 flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="text-white font-semibold text-base sm:text-lg mb-0 sm:mb-1">{title}</h3>
        <p className="text-gray-300 text-xs sm:text-sm">{description}</p>
      </div>
    </div>
  );
}