"use client";

import { useState } from "react";
import { Container } from "@/shared/ui/container";
import { Tabs } from "@/shared/ui/tabs";
import { mockBooks } from "@/features/book-dashboard/data/books";

const categories = [
  { id: "all", name: "Todos", icon: "📚" },
  { id: "romance", name: "Romance", icon: "💕" },
  { id: "terror", name: "Terror", icon: "👻" },
  { id: "fiction", name: "Ficção", icon: "🚀" },
  { id: "motivation", name: "Motivacional", icon: "💪" },
  { id: "fantasy", name: "Fantasia", icon: "✨" },
  { id: "drama", name: "Drama", icon: "🎭" },
  { id: "sci-fi", name: "Sci-Fi", icon: "🌌" },
  { id: "adventure", name: "Aventura", icon: "🗺️" },
];

const storyCategories = [
  "All",
  "Romance",
  "Terror",
  "Ficção",
  "Motivacional",
  "Fantasia",
  "Drama",
  "Sci-Fi",
  "Aventura",
];

export function CategoryPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredBooks = selectedCategory
    ? mockBooks.filter(
        (book) =>
          book.category.toLowerCase() === selectedCategory.toLowerCase(),
      )
    : mockBooks;

  return (
    <>
      <header className="sticky top-0 z-30 bg-primary-100/95 backdrop-blur-md border-b border-primary-300">
        <div className="px-4 py-4 lg:px-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Categorias
          </h1>
          <p className="text-sm text-gray-500 mt-1 hidden sm:block">
            Explore histórias por tema
          </p>
        </div>
      </header>

      <main className="p-4 lg:p-6">
        <Container>
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    setSelectedCategory(
                      category.id === "all" ? null : category.name,
                    )
                  }
                  className={`flex flex-col items-center p-4 rounded-2xl transition-all ${
                    (category.id === "all" && !selectedCategory) ||
                    selectedCategory === category.name
                      ? "bg-accent-500 text-white shadow-lg scale-105"
                      : "bg-white hover:bg-accent-100 shadow-sm"
                  }`}
                >
                  <span className="text-3xl mb-2">{category.icon}</span>
                  <span
                    className={`text-sm font-medium ${
                      (category.id === "all" && !selectedCategory) ||
                      selectedCategory === category.name
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {category.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="border-t border-primary-300 pt-6">
              <Tabs
                tabs={storyCategories}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                className="mb-6"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredBooks
                  .filter(
                    (book) =>
                      activeTab === "All" || book.category === activeTab,
                  )
                  .map((book) => (
                    <button
                      key={book.id}
                      className="flex flex-col items-center p-3 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                    >
                      <div
                        className="w-full aspect-2/3 max-w-35 rounded-lg shadow flex items-center justify-center p-2 mb-3"
                        style={{ backgroundColor: book.coverColor }}
                      >
                        <span className="text-white/90 font-display text-xs text-center line-clamp-3">
                          {book.title}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 text-center line-clamp-2 w-full">
                        {book.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {book.author}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <StarIcon className="w-3 h-3 text-warning" filled />
                        <span className="text-xs text-gray-600">
                          {book.rating}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>

              {filteredBooks.filter(
                (book) => activeTab === "All" || book.category === activeTab,
              ).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    Nenhuma história encontrada nesta categoria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}

function StarIcon({
  className,
  filled,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
