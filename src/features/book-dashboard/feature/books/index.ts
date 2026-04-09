// Books Feature - Public API

// Queries
export { getBooks, getBooksCached, getBooksPaginated } from './application/queries/get-books.query';
export { getCategories, getUserBookById } from './application/queries/get-categories.query';

// Commands
export { createBook } from './application/commands/create-book.command';
export { updateBook } from './application/commands/update-book.command';
export { deleteBook } from './application/commands/delete-book.command';
export { publishBook, unpublishBook } from './application/commands/publish-book.command';
export { markAsReading, markAsCompleted, updateReadingProgress } from './application/commands/update-reading-status.command';

// Presentation - Widgets
export { CategoryContent } from './presentation/widgets/category-content.widget';
export { CategoriesSectionWidget } from './presentation/widgets/categories-section.widget';
export { RecommendedSectionWidget } from './presentation/widgets/recommended-section.widget';
export { SearchResultsWidget } from './presentation/widgets/search-results.widget';

// Presentation - UI
export { BookCard } from './presentation/ui/book-card.ui';
export { MetricsCard } from './presentation/ui/metrics-card.ui';
export { RatingStars } from './presentation/ui/rating-stars.ui';

// Presentation - Pages
export { BookDashboardPage } from './presentation/pages/book-dashboard.page';

// Hooks
export { useBooks, useCategories, useSelectedBook, useBooksWithCache, useBookDashboard } from './hooks';