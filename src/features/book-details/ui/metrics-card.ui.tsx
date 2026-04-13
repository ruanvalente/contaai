type MetricsCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
}

export function MetricsCard({
  label,
  value,
  icon,
  className = "",
}: MetricsCardProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-2 bg-primary-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <div className="p-1 bg-accent-500/10 rounded-lg text-accent-600 mb-1">
        {icon}
      </div>
      <p className="text-sm font-bold text-gray-900 leading-none">
        {value}
      </p>
      <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
