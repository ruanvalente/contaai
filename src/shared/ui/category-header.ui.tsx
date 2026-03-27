type CategoryHeaderProps = {
  title?: string;
  subtitle?: string;
  className?: string;
};

export function CategoryHeader({
  title = "Categorias",
  subtitle = "Explore histórias por tema",
  className = "",
}: CategoryHeaderProps) {
  return (
    <header className={`sticky top-0 z-30 bg-primary-100/95 backdrop-blur-md border-b border-primary-300 ${className}`}>
      <div className="px-4 py-4 lg:px-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
          {title}
        </h1>
        <p className="text-sm text-gray-500 mt-1 hidden sm:block">
          {subtitle}
        </p>
      </div>
    </header>
  );
}
