type MetricsCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
  isLoading?: boolean;
}

export function MetricsCard({
  label,
  value,
  icon,
  className = "",
  onClick,
  isActive = false,
  isLoading = false,
}: MetricsCardProps) {
  const Component = onClick ? "button" : "div";
  
  return (
    <Component
      onClick={onClick}
      disabled={onClick ? false : undefined}
      className={`flex flex-col items-center justify-center p-2 rounded-xl shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${isActive ? 'bg-accent-500/10 border border-accent-500/30' : 'bg-primary-200 hover:bg-primary-200/80'} ${className}`}
    >
      <div className={`p-1 rounded-lg mb-1 ${isActive ? 'bg-accent-500/20 text-accent-600' : 'bg-accent-500/10 text-accent-600'}`}>
        {isLoading ? (
          <div className="w-3.5 h-3.5 animate-spin border-2 border-accent-500 border-t-transparent rounded-full" />
        ) : (
          icon
        )}
      </div>
      <p className={`text-sm font-bold leading-none ${isActive ? 'text-accent-600' : 'text-gray-900'}`}>
        {isActive ? '✓' : value}
      </p>
      <p className={`text-[10px] mt-0.5 ${isActive ? 'text-accent-600' : 'text-gray-500'}`}>{label}</p>
    </Component>
  );
}
