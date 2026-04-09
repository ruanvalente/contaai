// Re-exports públicos da feature book-dashboard
// Preferir usar imports diretos dos arquivos em application/ ao invés deste index
// Nota: Para cached queries, importar diretamente de @/features/book-dashboard/server/cached-queries

// BOOKS SUB-FEATURE
// Queries
export { getBooks, getBooksCached, getBooksPaginated } from './feature/books/application/queries/get-books.query';
export { getCategories, getUserBookById } from './feature/books/application/queries/get-categories.query';

// Commands
export { createBook } from './feature/books/application/commands/create-book.command';
export { updateBook } from './feature/books/application/commands/update-book.command';
export { deleteBook } from './feature/books/application/commands/delete-book.command';
export { publishBook, unpublishBook } from './feature/books/application/commands/publish-book.command';
export { markAsReading, markAsCompleted, updateReadingProgress as updateBookReadingProgress } from './feature/books/application/commands/update-reading-status.command';

// Presentation - Books Widgets
export { CategoryContent } from './feature/books/presentation/widgets/category-content.widget';
export { CategoriesSectionWidget } from './feature/books/presentation/widgets/categories-section.widget';
export { RecommendedSectionWidget } from './feature/books/presentation/widgets/recommended-section.widget';
export { SearchResultsWidget } from './feature/books/presentation/widgets/search-results.widget';

// Presentation - Books UI
export { BookCard } from './feature/books/presentation/ui/book-card.ui';
export { BookOpenIcon, MenuIcon, CloseIcon, UsersIcon, MessageIcon, SearchIcon, FilterIcon, ChevronLeftIcon, ChevronRightIcon, StarIcon } from './feature/books/presentation/ui/icons.ui';
export { MetricsCard } from './feature/books/presentation/ui/metrics-card.ui';
export { RatingStars } from './feature/books/presentation/ui/rating-stars.ui';

// Presentation - Books Pages
export { BookDashboardPage } from './feature/books/presentation/pages/book-dashboard.page';

// LIBRARY SUB-FEATURE
// Presentation - Library Widgets
export { FavoritesContent } from './feature/library/presentation/widgets/favorites-content.widget';
export { DownloadsContent } from './feature/library/presentation/widgets/downloads-content.widget';
export { LibraryContent } from './feature/library/presentation/widgets/library-content.widget';

// Library Queries
export { getUserBooks, getUserReadingBooks, getUserCompletedBooks, getUserBookById as getLibraryUserBookById } from './feature/library/application/queries';

// Library Commands
export { createUserBook, deleteUserBook, updateUserBook, updateReadingProgress as updateLibraryReadingProgress } from './feature/library/application/commands';

// EDITOR SUB-FEATURE
// Commands
export { saveContent } from './feature/editor/application/commands/save-content.command';

// Presentation - Editor Widgets
export { BookEditor } from './feature/editor/presentation/widgets/book-editor.widget';
export { BookEditorHeader } from './feature/editor/presentation/widgets/book-editor-header.widget';
export { ToolbarButton, ToolbarDivider } from './feature/editor/presentation/widgets/book-editor-toolbar';
export { BookPreviewModal } from './feature/editor/presentation/widgets/book-preview-modal.widget';
export { ContentRecoveryModal } from './feature/editor/presentation/widgets/content-recovery-modal.widget';
export { CreateBookModal } from './feature/editor/presentation/widgets/create-book-modal.widget';
export { EditorContentSync } from './feature/editor/presentation/widgets/editor-content-sync.widget';
export { EditorToolbar } from './feature/editor/presentation/widgets/editor-toolbar.widget';
export { BookDetailsModalWidget } from './feature/editor/presentation/widgets/book-details-modal.widget';
export { BookDetailsPanelWidget } from './feature/editor/presentation/widgets/book-details-panel.widget';

// BOOKS HOOKS
export { useBooks, useCategories, useSelectedBook, useBooksWithCache, useBookDashboard } from './feature/books/hooks';

// EDITOR HOOKS
export { useBookEditor, useEditorToolbar, useEditorBackup, useEditorBackupInterval, useEditorPublish } from './feature/editor/hooks';

// Legacy exports (deprecated - use feature/* paths)
export { getCurrentUserBooks, getPublishedBooks } from './application/queries/get-user-books.query';
