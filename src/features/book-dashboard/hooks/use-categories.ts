"use client";

import { useMemo, useState } from "react";
import { Category, CATEGORIES } from "../types/book.types";

type UseCategoriesReturn = {
  categories: Category[];
  activeCategory: Category;
  setActiveCategory: (category: Category) => void;
}

export function useCategories(
  initialCategory: Category = "All"
): UseCategoriesReturn {
  const [activeCategory, setActiveCategory] = useState<Category>(
    initialCategory
  );

  const categories = useMemo(() => CATEGORIES, []);

  return {
    categories,
    activeCategory,
    setActiveCategory,
  };
}
