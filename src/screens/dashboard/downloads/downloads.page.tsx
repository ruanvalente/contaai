"use client";

import { useState } from "react";
import { Container } from "@/shared/ui/container";
import { mockBooks } from "@/features/book-dashboard/data/books";

const downloadedBooks = mockBooks.slice(0, 4);

export function DownloadsPage() {
  const [downloads, setDownloads] = useState(downloadedBooks);

  const removeDownload = (id: string) => {
    setDownloads(downloads.filter((book) => book.id !== id));
  };

  const totalSize = downloads.length * 2.5;

  return (
    <>
      <header className="sticky top-0 z-30 bg-primary-100/95 backdrop-blur-md border-b border-primary-300">
        <div className="px-4 py-4 lg:px-6">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Downloads
          </h1>
          <p className="text-sm text-gray-500 mt-1 hidden sm:block">
            Suas histórias offline
          </p>
        </div>
      </header>

      <main className="p-4 lg:p-6">
        <Container>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-500/10 rounded-lg flex items-center justify-center">
                    <StorageIcon className="w-5 h-5 text-accent-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Armazenamento usado</p>
                    <p className="text-xs text-gray-500">{downloads.length} histórias baixadas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{totalSize.toFixed(1)} MB</p>
                  <p className="text-xs text-gray-500">de 500 MB</p>
                </div>
              </div>
              <div className="mt-3 w-full h-2 bg-primary-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent-500 rounded-full transition-all" 
                  style={{ width: `${(totalSize / 500) * 100}%` }} 
                />
              </div>
            </div>

            {downloads.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DownloadIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum download</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Baixe histórias para ler offline. Elas aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">Histórias baixadas</h2>
                  <button className="text-sm text-accent-600 hover:underline">
                    Baixar mais
                  </button>
                </div>

                {downloads.map((book) => (
                  <div
                    key={book.id}
                    className="flex gap-3 p-3 bg-white rounded-xl shadow-sm"
                  >
                    <div
                      className="w-16 h-24 rounded-lg shadow flex-shrink-0 flex items-center justify-center p-1"
                      style={{ backgroundColor: book.coverColor }}
                    >
                      <span className="text-white/90 font-display text-[10px] text-center line-clamp-4">
                        {book.title}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">2.5 MB</span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-400">{book.pages} páginas</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeDownload(book.id)}
                        className="p-2 text-gray-400 hover:text-error transition-colors"
                        aria-label="Remover download"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                      <button className="text-xs px-3 py-1.5 rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-colors">
                        Ler
                      </button>
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

function StorageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <path d="M7 7h.01M7 12h.01M7 17h.01M12 7h5M12 12h5M12 17h5" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
