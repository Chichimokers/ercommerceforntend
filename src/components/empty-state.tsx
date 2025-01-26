import { AlertCircle } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  message: string;
  iconSize?: number;
  className?: string;
  children?: ReactNode;
}

export default function EmptyState({
  message,
  iconSize = 48,
  className = "",
  children,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 space-y-4 ${className}`}
    >
      <div className="relative">
        <AlertCircle size={iconSize} className="text-gray-400 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-0 animate-pulse-blend mix-blend-screen" />
      </div>

      <h3 className="text-xl font-semibold text-gray-600 text-center">
        {message}
      </h3>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
