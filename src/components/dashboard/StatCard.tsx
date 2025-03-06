
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { cva, type VariantProps } from "class-variance-authority";

const statCardVariants = cva(
  "transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-gray-800",
        primary: "bg-primary-600 text-white",
        secondary: "bg-gray-200 dark:bg-gray-700",
        success: "bg-green-500 text-white",
        warning: "bg-amber-500 text-white",
        danger: "bg-red-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface StatCardProps extends VariantProps<typeof statCardVariants> {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  footer?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  footer,
  trend,
  trendValue,
  variant,
  className,
}: StatCardProps) {
  return (
    <Card 
      className={cn(
        "overflow-hidden border transition-all hover:shadow-md",
        statCardVariants({ variant }),
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className={cn(
              "text-sm font-medium",
              variant ? "text-white/80" : "text-muted-foreground"
            )}>
              {title}
            </p>
            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
            
            {trend && trendValue && (
              <p className={cn(
                "flex items-center text-xs font-medium",
                trend === "up" 
                  ? "text-emerald-500 dark:text-emerald-400" 
                  : trend === "down" 
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
              )}>
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
              </p>
            )}
          </div>
          
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            variant === "primary" 
              ? "bg-white/20" 
              : variant && variant !== "default" 
              ? "bg-white/20" 
              : "bg-primary-100 dark:bg-primary-900/30"
          )}>
            {icon}
          </div>
        </div>
        
        {footer && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
