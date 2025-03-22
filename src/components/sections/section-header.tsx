import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  linkText?: string;
  linkHref?: string;
  icon?: React.ElementType;
}

export default function SectionHeader({ title, linkText, linkHref, icon: Icon }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-default-200 dark:border-gray-700 px-4 sm:px-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
        {Icon && <Icon className="text-blue-600 dark:text-blue-400" />}
        {title}
      </h2>
      {linkText && linkHref && (
        <Link
          className="mt-4 sm:mt-0 text-blue-600 dark:text-blue-400 flex items-center gap-2 hover:underline"
          href={linkHref}
        >
          {linkText}
          <ArrowRight className="w-5 h-5" />
        </Link>
      )}
    </div>
  );
}