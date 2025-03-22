export default function GradientBackground() {
  return (
    <>
      <div className="md:hidden absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-100/20 dark:bg-blue-900/10" />
        <div className="absolute top-10 -left-10 w-30 h-30 rounded-full bg-purple-100/20 dark:bg-purple-900/10" />
      </div>

      <div className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-100/30 to-blue-300/10 dark:from-blue-800/10 dark:to-blue-900/5" />
        <div className="absolute top-20 -left-20 w-60 h-60 rounded-full bg-gradient-to-tr from-purple-100/20 to-purple-300/10 dark:from-purple-800/10 dark:to-purple-900/5" />
        <div className="absolute bottom-10 right-1/4 w-32 h-32 rounded-full bg-gradient-to-tl from-teal-100/10 to-teal-300/5 dark:from-teal-800/10 dark:to-teal-900/5" />
      </div>
    </>
  );
}