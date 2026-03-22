"use client";

import { useState } from "react";
import { Container } from "@/shared/ui/container";
import { Button } from "@/shared/ui/button";
import { mockBooks } from "@/features/book-dashboard/data/books";

type TabType = "my-stories" | "reading" | "completed";

const tabs: { id: TabType; label: string }[] = [
  { id: "my-stories", label: "Minhas Histórias" },
  { id: "reading", label: "Em Leitura" },
  { id: "completed", label: "Concluídas" },
];

const myStories = mockBooks.slice(0, 3);
const readingBooks = mockBooks.slice(3, 6);
const completedBooks = mockBooks.slice(6, 9);

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabType>("my-stories");

  const getBooks = () => {
    switch (activeTab) {
      case "my-stories":
        return myStories;
      case "reading":
        return readingBooks;
      case "completed":
        return completedBooks;
      default:
        return [];
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case "my-stories":
        return "Você ainda não criou nenhuma história. Comece sua primeira obra!";
      case "reading":
        return "Nenhuma história em andamento. Continue de onde parou!";
      case "completed":
        return "Nenhuma história concluída ainda. Continue lendo!";
      default:
        return "";
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-primary-100/95 backdrop-blur-md border-b border-primary-300">
        <div className="flex items-center justify-between px-4 py-4 lg:px-6">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              Minha Biblioteca
            </h1>
            <p className="text-sm text-gray-500 mt-1 hidden sm:block">
              Suas histórias em um só lugar
            </p>
          </div>
          <Button variant="primary" className="text-sm px-4 py-2 rounded-xl">
            + Nova História
          </Button>
        </div>
      </header>

      <main className="p-4 lg:p-6">
        <Container>
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "bg-accent-500 text-white"
                      : "bg-white text-gray-700 border border-primary-300 hover:bg-primary-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {getBooks().length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 max-w-sm mx-auto">{getEmptyMessage()}</p>
                {activeTab === "my-stories" && (
                  <Button variant="primary" className="mt-4">
                    Criar Primeira História
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {getBooks().map((book) => (
                  <div
                    key={book.id}
                    className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all"
                  >
                    <div
                      className="w-20 h-28 sm:w-24 sm:h-32 rounded-lg shadow flex-shrink-0 flex items-center justify-center p-2"
                      style={{ backgroundColor: book.coverColor }}
                    >
                      <span className="text-white/90 font-display text-xs text-center line-clamp-4">
                        {book.title}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{book.author}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="text-xs">{book.category}</Badge>
                        <span className="text-xs text-gray-400">{book.pages} páginas</span>
                      </div>
                      {activeTab === "reading" && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">Progresso</span>
                            <span className="text-xs text-gray-700 font-medium">65%</span>
                          </div>
                          <div className="w-full h-2 bg-primary-200 rounded-full overflow-hidden">
                            <div className="h-full w-[65%] bg-accent-500 rounded-full" />
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button variant="secondary" className="text-xs px-3 py-1.5 rounded-lg">
                          {activeTab === "my-stories" ? "Editar" : "Continuar"}
                        </Button>
                        {activeTab !== "completed" && (
                          <Button variant="secondary" className="text-xs px-3 py-1.5 rounded-lg">
                            Ver Detalhes
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Container>
      </main>
    </>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-gray-700 ${className}`}>
      {children}
    </span>
  );
}
