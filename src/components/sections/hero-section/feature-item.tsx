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
    <div className="flex flex-row sm:flex-col items-center text-left sm:text-center p-3 sm:p-4">
      <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full ${bgColor} flex items-center justify-center mr-3 sm:mr-0 sm:mb-4 flex-shrink-0 shadow-inner border border-white/30 dark:border-white/10`}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 text-gray-800 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}