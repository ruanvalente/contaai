type UsePaginationProps = {
  currentPage: number;
  totalPages: number;
  maxVisible?: number;
};

type UsePaginationReturn = {
  pageNumbers: (number | string)[];
  canGoPrevious: boolean;
  canGoNext: boolean;
  goToPage: (page: number) => void;
  goToPrevious: () => void;
  goToNext: () => void;
};

export function usePagination({
  currentPage,
  totalPages,
  maxVisible = 5,
}: UsePaginationProps): UsePaginationReturn {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const calculatePageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return {
    pageNumbers: calculatePageNumbers(),
    canGoPrevious,
    canGoNext,
    goToPage: () => {},
    goToPrevious: () => {},
    goToNext: () => {},
  };
}

type PaginationButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isActive?: boolean;
  ariaLabel?: string;
  ariaCurrent?: boolean;
};

function PaginationButton({
  children,
  onClick,
  disabled,
  isActive,
  ariaLabel,
  ariaCurrent,
}: PaginationButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-accent-500 text-white"
          : "bg-white border border-primary-300 text-gray-700 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
      }`}
      aria-label={ariaLabel}
      aria-current={ariaCurrent ? "page" : undefined}
    >
      {children}
    </button>
  );
}

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const { pageNumbers, canGoPrevious, canGoNext } = usePagination({
    currentPage,
    totalPages,
  });

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Navegação de páginas">
      <PaginationButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        ariaLabel="Página anterior"
      >
        Anterior
      </PaginationButton>

      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) =>
          typeof page === "number" ? (
            <PaginationButton
              key={index}
              onClick={() => onPageChange(page)}
              isActive={currentPage === page}
              ariaLabel={`Página ${page}`}
            >
              {page}
            </PaginationButton>
          ) : (
            <span key={index} className="px-2 text-gray-500">
              {page}
            </span>
          )
        )}
      </div>

      <PaginationButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        ariaLabel="Próxima página"
      >
        Próxima
      </PaginationButton>
    </nav>
  );
}