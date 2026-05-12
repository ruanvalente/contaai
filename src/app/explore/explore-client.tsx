'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { BookCover } from '@/shared/ui/book-cover.ui';
import { StarRating } from '@/shared/ui/star-rating.ui';
import { Search } from 'lucide-react';
import { getPublicBooksAction } from '@/features/public-books/actions/public-books.actions';
import type { PublicBookListItem } from '@/features/public-books/types/public-books.types';
import type { Category } from '@/server/domain/entities/book.entity';
import { motion } from 'framer-motion';

interface ExploreClientProps {
  initialBooks: PublicBookListItem[];
  initialTotalPages: number;
  selectedCategory: Category;
}

const CATEGORIES: Category[] = ["All", "Sci-Fi", "Fantasy", "Drama", "Business", "Education", "Geography"];

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
        <Link href={`/book/${book.id}`} className="hover:underline">
          <h3 className="font-display font-semibold text-gray-900 text-base leading-tight">
            {book.title}
          </h3>
        </Link>
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

function BookSkeleton() {
  return (
    <div className="animate-pulse flex flex-col items-center">
      <div className="bg-gray-300 rounded-lg w-full aspect-[3/4] max-w-[160px]" />
      <div className="mt-2 h-4 w-3/4 bg-gray-300 rounded" />
      <div className="mt-1 h-3 w-1/2 bg-gray-200 rounded" />
    </div>
  );
}

export function ExploreClient({
  initialBooks,
  initialTotalPages,
  selectedCategory,
}: ExploreClientProps) {
  const [books, setBooks] = useState<PublicBookListItem[]>(initialBooks);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [category, setCategory] = useState<Category>(selectedCategory);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMoreBooks = useCallback(async () => {
    if (isLoadingMore || currentPage >= totalPages) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const filters = category === "All" 
        ? { page: nextPage, limit: 20 }
        : { category, page: nextPage, limit: 20 };
      
      const result = await getPublicBooksAction(filters);
      setBooks(prev => [...prev, ...result.books]);
      setCurrentPage(nextPage);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load more books:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, totalPages, isLoadingMore, category]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && currentPage < totalPages) {
          loadMoreBooks();
        }
      },
      { rootMargin: '200px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMoreBooks, isLoadingMore, currentPage, totalPages]);

  useEffect(() => {
    async function loadCategoryBooks() {
      if (category === selectedCategory) return;
      
      setIsLoadingMore(true);
      try {
        const filters = category === "All" 
          ? { page: 1, limit: 20 }
          : { category, page: 1, limit: 20 };
        
        const result = await getPublicBooksAction(filters);
        setBooks(result.books);
        setCurrentPage(1);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error('Failed to load category books:', error);
      } finally {
        setIsLoadingMore(false);
      }
    }

    loadCategoryBooks();
  }, [category, selectedCategory]);

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
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-accent-500 text-white'
                  : 'bg-primary-100 text-gray-700 hover:bg-primary-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {filteredBooks.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {filteredBooks.map((book, index) => (
              <FeaturedBookCard key={book.id} book={book} index={index % 20} />
            ))}
            {isLoadingMore && (
              <>
                <BookSkeleton />
                <BookSkeleton />
                <BookSkeleton />
                <BookSkeleton />
                <BookSkeleton />
              </>
            )}
          </div>
          
          <div ref={loadMoreRef} className="h-4" />
          
          {!isLoadingMore && currentPage < totalPages && (
            <div className="text-center py-4 text-sm text-gray-500">
              Role para carregar mais livros
            </div>
          )}
          
          {!isLoadingMore && currentPage >= totalPages && books.length > 0 && (
            <div className="text-center py-4 text-sm text-gray-500">
              Fim da lista
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery
              ? 'Nenhum livro encontrado para esta busca'
              : 'Nenhum livro encontrado nesta categoria'}
          </p>
        </div>
      )}
    </>
  );
}