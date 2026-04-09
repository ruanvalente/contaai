// Server-side cached queries - separated for "use cache" compatibility
// These functions use Next.js 16 "use cache" directive and must be imported directly

export { getCachedBooks, getCachedBookById, getCachedCategories, getCachedBooksByCategory, searchCachedBooks } from '../data/cached-books';