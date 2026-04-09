// Discovery Feature - Re-exports para nova estrutura

// Stores
export { useSearchStore } from './stores/search.store';
export { useFavoritesStore } from './stores/favorites.store';
export { usePaginationCache, generatePaginationKey } from './stores/pagination-cache.store';
export { useCategoryCache, generateCacheKey } from './stores/category-cache.store';

// Hooks
export { useFavorites } from './hooks/use-favorites';
export { useSearch } from './hooks/use-search';
export { useDiscover } from './hooks/use-discover.hook';
export { useFavoritesSearch } from './hooks/use-favorites-search';
export { useCategoryIcons } from './hooks/use-category-icons';
export { useCategoryFilter } from './hooks/use-category-filter';

// Application - Queries
export { searchBooks, getBooksByCategory } from './application/queries/search-books.query';

// Application - Commands
export { addFavorite, removeFavorite, toggleFavorite } from './application/commands/favorite.command';

// Presentation - Widgets
export { SearchResults } from './presentation/widgets/search-results.widget';
export { DiscoverContent } from './presentation/widgets/discover-content.widget';
export { BookDetailsModal } from './presentation/widgets/book-details-modal.widget';
export { Header } from './presentation/widgets/landing-header.widget';
export { Hero } from './presentation/widgets/landing-hero.widget';
export { BookCarousel } from './presentation/widgets/landing-book-carousel.widget';

// Presentation - UI Components
export { BookGrid } from './presentation/ui/book-grid.ui';
export { BookCard } from './presentation/ui/book-card.ui';
export { SearchInput } from './presentation/ui/search-input.ui';
export { EmptyState } from './presentation/ui/empty-state.ui';