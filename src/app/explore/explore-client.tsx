'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookCover } from '@/shared/ui/book-cover.ui';
import { StarRating } from '@/shared/ui/star-rating.ui';
import { BookSearch } from '@/shared/ui/book-search.ui';
import type { PublicBookListItem } from '@/features/public-books/types/public-books.types';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

interface ExploreClientProps {
  books: PublicBookListItem[];
  totalPages: number;
  currentPage: number;
  selectedCategory: string;
}

const CATEGORIES = ['All', 'Sci-Fi', 'Fantasy', 'Drama', 'Business', 'Education', 'Geography'];

function FeaturedBookCard({ book, index }: { book: PublicBookListItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="flex flex-col items-center"
    >
      <Link href={`/book/${book.id}`} className="block group">
        <div className="relative">
          <BookCover
            title={book.title}
            coverUrl={book.coverUrl}
            coverColor={book.coverColor || '#4A5568'}
            size="lg"
            className="shadow-lg transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
      <div className="mt-3 text-center">
        <h3 className="font-display font-semibold text-gray-900 text-base leading-tight">
          {book.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{book.author}</p>
        {book.rating !== null && book.rating !== undefined && (
          <div className="mt-2 flex justify-center">
            <StarRating rating={book.rating} size="sm" showValue={false} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ExploreClient({
  books,
  totalPages,
  currentPage,
  selectedCategory,
}: ExploreClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = searchQuery
    ? books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : books;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 mb-4">
          Explorar Livros
        </h1>
        <p className="text-gray-700 max-w-xl mx-auto">
          Descubra histórias, contos e narrativas de diversos autores.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="max-w-md mx-auto mb-8"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar livros..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-primary-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex justify-center mb-8"
      >
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/explore?category=${cat}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-accent-500 text-white'
                  : 'bg-primary-100 text-gray-700 hover:bg-primary-300'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </motion.div>

      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          {filteredBooks.map((book, index) => (
            <FeaturedBookCard key={book.id} book={book} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery
              ? 'Nenhum livro encontrado para esta busca'
              : 'Nenhum livro encontrado nesta categoria'}
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12 flex justify-center gap-2"
        >
          {currentPage > 1 && (
            <Link
              href={`/explore?category=${selectedCategory}&page=${currentPage - 1}`}
              className="px-4 py-2 rounded-lg bg-primary-100 text-gray-700 hover:bg-primary-300 transition-colors"
            >
              Anterior
            </Link>
          )}
          <span className="px-4 py-2 text-gray-700">
            Página {currentPage} de {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/explore?category=${selectedCategory}&page=${currentPage + 1}`}
              className="px-4 py-2 rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-colors"
            >
              Próxima
            </Link>
          )}
        </motion.div>
      )}
    </>
  );
}