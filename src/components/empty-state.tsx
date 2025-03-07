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
      className={`flex flex-col items-center justify-center p-8 space-y-4 bg-default-50/50 backdrop-blur-sm border rounded-xl ${className}`}
    >
      <div className="relative group">
        <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/30 to-blue-400/30 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300 animate-[pulse_2s_infinite]" />
        <AlertCircle
          size={iconSize}
          className="text-gray-400/80 group-hover:text-gray-400 transition-colors duration-300 relative z-10 animate-float"
        />
      </div>

      <h3 className="text-2xl font-semibold text-default-400 text-center leading-snug tracking-tight">
        {message}
      </h3>

      {children && <div className="mt-6 w-full pt-6 border-t border-gray-100/50 justify-items-center">{children}</div>}
    </div>
  );
}
