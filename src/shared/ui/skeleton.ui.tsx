interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-primary-200 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function BookCardSkeleton() {
  return (
    <div className="flex flex-col items-center p-3 rounded-2xl bg-white">
      <Skeleton className="w-full aspect-2/3 rounded-lg mb-3" />
      <Skeleton className="w-3/4 h-4 rounded mb-1" />
      <Skeleton className="w-1/2 h-3 rounded" />
      <Skeleton className="w-12 h-3 mt-2 rounded" />
    </div>
  );
}

export function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center p-4 rounded-2xl bg-white"
        >
          <Skeleton className="w-12 h-12 rounded-full mb-2" />
          <Skeleton className="w-16 h-4 rounded" />
        </div>
      ))}
    </div>
  );
}

export function BookListSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SearchInputSkeleton() {
  return (
    <div className="relative mb-4">
      <Skeleton className="w-full h-10 rounded-xl" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <Skeleton className="w-48 h-8 rounded mb-2" />
        <Skeleton className="w-64 h-4 rounded" />
      </div>
      <CategoryGridSkeleton />
      <div className="border-t border-primary-300 pt-6 mt-6">
        <div className="flex gap-2 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-16 h-8 rounded-full" />
          ))}
        </div>
        <SearchInputSkeleton />
        <BookListSkeleton />
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12" role="status">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-accent-500 rounded-full animate-spin" />
      <span className="sr-only">Carregando...</span>
    </div>
  );
}