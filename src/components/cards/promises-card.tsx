import React from "react";

interface PromisesCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function PromisesCard({
  icon,
  title,
  description,
}: PromisesCardProps) {
  return (
    <div className="
      group 
      border 
      bg-blue-50/75
      dark:bg-gray-800/75
      border-gray-200 
      dark:border-gray-700 
      rounded-3xl 
      p-6 
      shadow-sm 
      hover:shadow-md 
    ">
      <div className="flex items-center gap-3 mb-3">
        <div className="
          text-2xl 
          text-blue-600 
          dark:text-blue-400 
          p-3 
          bg-blue-200/75
          dark:bg-gray-900/75
          rounded-full 
        ">
          {icon}
        </div>
        <h3 className="
          text-lg 
          font-bold 
          text-gray-800 
          dark:text-gray-100 
          transition-colors 
          duration-300
        ">
          {title}
        </h3>
      </div>
      <p className="
        text-sm 
        text-gray-700 
        dark:text-gray-300 
        leading-relaxed 
        group-hover:text-gray-800 
        dark:group-hover:text-gray-100 
        transition-colors 
        duration-300
      ">
        {description}
      </p>
    </div>
  );
}
