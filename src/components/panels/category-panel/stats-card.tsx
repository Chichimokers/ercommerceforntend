import React from "react";

export const colorVariants = {
  blue: {
    icon: "text-white",
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    gradient: "bg-gradient-to-br from-blue-500 to-blue-600"
  },
  purple: {
    icon: "text-white",
    text: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    gradient: "bg-gradient-to-br from-purple-500 to-purple-600"
  },
  green: {
    icon: "text-white",
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
    gradient: "bg-gradient-to-br from-green-500 to-green-600"
  },
  amber: {
    icon: "text-white",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    gradient: "bg-gradient-to-br from-amber-500 to-amber-600"
  }
};

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass: {
    icon: string;
    text: string;
    bg: string;
    gradient: string;
  };
  large?: boolean;
}

export default function StatsCard({
  icon,
  label,
  value,
  colorClass,
  large = false
}: StatsCardProps) {
  return (
    <div className={`
      bg-white dark:bg-gray-800 
      border border-gray-100 dark:border-gray-700
      rounded-xl p-4 sm:p-5 h-full shadow-lg
    `}>
      <div className={large ? 'flex items-start gap-4' : 'flex items-center gap-3'}>
        <div className={`${colorClass.bg} rounded-xl flex-shrink-0 p-3`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide truncate">
            {label}
          </p>
          <h3 className={`text-lg sm:text-xl font-bold mt-1 ${colorClass.text}`}>
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}