interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  const variantStyles = {
    default: "bg-gray-100 text-gray-700",
    primary: "bg-accent-500/10 text-accent-600",
    secondary: "bg-accent-500/10 text-accent-600",
    outline: "border border-border text-gray-700",
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
