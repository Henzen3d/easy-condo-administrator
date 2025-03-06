
import { Building } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 26,
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="bg-primary-600 text-white p-1.5 rounded-md flex items-center justify-center">
        <Building size={iconSizes[size]} className="animate-bounce-subtle" />
      </div>
      {showText && (
        <span className={cn("font-semibold tracking-tight", sizeClasses[size])}>
          <span className="text-primary-600">Condo</span>
          <span className="text-gray-800 dark:text-gray-200">Admin</span>
        </span>
      )}
    </div>
  );
}
