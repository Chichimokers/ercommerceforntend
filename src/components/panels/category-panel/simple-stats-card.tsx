import React from "react";

interface SimpleStatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass: {
    icon: string;
    text: string;
    bg: string;
    gradient: string;
  };
}

export default function SimpleStatsCard({
  icon,
  label,
  value,
  colorClass
}: SimpleStatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 h-full">
      <div className="flex items-center gap-3">
        <div className={`${colorClass.bg} rounded-lg flex-shrink-0 p-2`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide truncate">
            {label}
          </p>
          <h3 className={`text-base font-bold mt-0.5 ${colorClass.text}`}>
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}