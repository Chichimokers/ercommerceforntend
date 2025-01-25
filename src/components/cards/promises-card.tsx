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
    <div className="bg-slate-300 dark:bg-zinc-600 dark:bg-opacity-40 bg-opacity-40 backdrop-blur-lg shadow-sm p-6 rounded-xl">
      <div className="text-4xl mb-4 ">{icon}</div>
      <h3 className="text-xl font-bold mb-2 select-none cursor-default">
        {title}
      </h3>
      <p className="select-none cursor-default">{description}</p>
    </div>
  );
}
