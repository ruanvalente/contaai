interface DiscoverHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  onLogin: () => void;
}

export function DiscoverHeader({ query, onQueryChange, onLogin }: DiscoverHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-primary-100/95 backdrop-blur-md border-b border-primary-300">
      <div className="flex items-center gap-2 px-3 py-3 lg:px-6">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 min-w-0">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-primary-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
            />
            {query && (
              <button
                onClick={() => onQueryChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary-200"
                aria-label="Limpar busca"
              >
                <CloseIcon className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <button
            onClick={onLogin}
            className="shrink-0 px-4 py-2 bg-accent-500 text-white rounded-full text-sm font-medium whitespace-nowrap hover:bg-accent-600 transition-colors"
          >
            Entrar
          </button>
        </div>
      </div>
    </header>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
