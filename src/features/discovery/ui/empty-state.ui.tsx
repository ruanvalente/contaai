import { Search, Library } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && (
        <div className="w-20 h-20 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mx-auto">{description}</p>
    </div>
  );
}

export function SearchEmptyIcon() {
  return <Search className="w-10 h-10 text-gray-400" />;
}

export function BookEmptyIcon() {
  return <Library className="w-10 h-10 text-gray-400" />;
}
