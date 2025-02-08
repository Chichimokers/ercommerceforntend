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
    <div className="group bg-slate-300 dark:bg-zinc-600 dark:bg-opacity-40 bg-opacity-40 backdrop-blur-sm hover:backdrop-blur duration-300 shadow-sm hover:shadow-md p-6 rounded-xl hover:scale-[1.02] transform-gpu hover:bg-opacity-60 dark:hover:bg-opacity-60 transition-all">
      <div className="text-4xl mb-3 transition-colors duration-300 text-blue-400 dark:text-blue-300 animate-pulse">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 select-none text-gray-800 dark:text-gray-100 group-hover:text-black dark:group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="select-none text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors leading-relaxed">
        {description}
      </p>
    </div>
  );
}
