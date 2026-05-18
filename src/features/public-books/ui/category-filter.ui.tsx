import { Category, CATEGORIES } from "@/server/domain/entities/book.entity";
import { cn } from "@/utils/cn";

type CategoryFilterProps = {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  className?: string;
};

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  className,
}: CategoryFilterProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            selectedCategory === category
              ? "bg-accent-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}