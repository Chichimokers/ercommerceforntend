import React from "react";

export default function PromisesCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group bg-gray-100 dark:bg-zinc-800 dark:bg-opacity-40 bg-opacity-40 backdrop-blur-sm hover:backdrop-blur duration-300 shadow-sm hover:shadow-md p-4 rounded-xl hover:scale-[1.02] transform-gpu hover:bg-opacity-60 dark:hover:bg-opacity-60 transition-all border border-default-200">
      <div className="flex flex-row gap-2 items-center">
        <div className="text-2xl mb-3 text-blue-600 dark:text-blue-800 p-2 rounded-full bg-indigo-200 dark:bg-blue-200 w-max h-max">
          {icon}
        </div>
        <h3 className="text-lg font-bold mb-2 select-none text-gray-800 dark:text-gray-100 group-hover:text-black dark:group-hover:text-white transition-colors">
          {title}
        </h3>
      </div>
      <p className="select-none text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors leading-relaxed">
        {description}
      </p>
    </div>
  );
}
