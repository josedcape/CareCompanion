import { cn } from "@/lib/utils";

interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  return (
    <span className={cn("material-icons", className)}>
      {name}
    </span>
  );
}

interface CategoryIconProps {
  category: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  withBackground?: boolean;
}

export function CategoryIcon({ 
  category, 
  size = "md", 
  className,
  withBackground = false
}: CategoryIconProps) {
  const iconName = category === "medicine" 
    ? "medication" 
    : category === "meal" 
      ? "restaurant" 
      : "event";
  
  const bgColor = category === "medicine"
    ? "bg-blue-100"
    : category === "meal"
      ? "bg-green-100"
      : "bg-orange-100";
  
  const textColor = category === "medicine"
    ? "text-primary"
    : category === "meal"
      ? "text-success"
      : "text-secondary";
  
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  if (withBackground) {
    return (
      <div className={cn("rounded-full p-2 flex items-center justify-center", bgColor, className)}>
        <span className={cn("material-icons", textColor, sizeClasses[size])}>{iconName}</span>
      </div>
    );
  }

  return (
    <span className={cn("material-icons", textColor, sizeClasses[size], className)}>
      {iconName}
    </span>
  );
}
