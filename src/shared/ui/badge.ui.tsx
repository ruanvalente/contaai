type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-gray-700 ${className}`}
    >
      {children}
    </span>
  );
}
