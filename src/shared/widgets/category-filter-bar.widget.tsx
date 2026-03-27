"use client";

import { useCategoryIcons } from "@/shared/hooks/use-category-icons";

type CategoryFilterBarProps = {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
};

export function CategoryFilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterBarProps) {
  const { getIcon } = useCategoryIcons();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      <button
        onClick={() => onSelectCategory(null)}
        className={`flex flex-col items-center p-4 rounded-2xl transition-all ${
          !selectedCategory
            ? "bg-accent-500 text-white shadow-lg scale-105"
            : "bg-white hover:bg-accent-100 shadow-sm"
        }`}
        aria-pressed={!selectedCategory}
      >
        <span className="text-3xl mb-2">{getIcon("All")}</span>
        <span
          className={`text-sm font-medium ${!selectedCategory ? "text-white" : "text-gray-700"}`}
        >
          Todos
        </span>
      </button>

      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`flex flex-col items-center p-4 rounded-2xl transition-all ${
            selectedCategory === category
              ? "bg-accent-500 text-white shadow-lg scale-105"
              : "bg-white hover:bg-accent-100 shadow-sm"
          }`}
          aria-pressed={selectedCategory === category}
        >
          <span className="text-3xl mb-2">{getIcon(category)}</span>
          <span
            className={`text-sm font-medium ${selectedCategory === category ? "text-white" : "text-gray-700"}`}
          >
            {category}
          </span>
        </button>
      ))}
    </div>
  );
}
