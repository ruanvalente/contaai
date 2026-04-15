type StatsCardProps = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  className = "",
}: StatsCardProps) {
  return (
    <div
      className={`flex items-center gap-3 p-4 bg-primary-200 rounded-xl ${className}`}
    >
      {icon && (
        <div className="p-2 bg-accent-500/10 rounded-lg text-accent-600">{icon}</div>
      )}
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
