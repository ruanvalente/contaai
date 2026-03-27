import { Search } from "lucide-react";

type FavoritesSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function FavoritesSearchBar({ value, onChange }: FavoritesSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar nos favoritos..."
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-primary-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
        aria-label="Buscar nos favoritos"
      />
    </div>
  );
}
