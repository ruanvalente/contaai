import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

export function Button({
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    "px-6 py-3 rounded-full font-medium transition-all duration-300 inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2";

  const variants = {
    primary: "bg-accent-500 text-white hover:bg-accent-600",
    secondary:
      "border border-accent-500 text-accent-500 bg-transparent hover:bg-accent-100",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variants[variant],
        className,
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {children}
    </motion.button>
  );
}
