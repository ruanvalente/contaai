import { Button } from "@/shared/ui/button";

type LibraryHeaderProps = {
  onCreateClick: () => void;
};

export function LibraryHeader({ onCreateClick }: LibraryHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-primary-100/95 backdrop-blur-md border-b border-primary-300">
      <div className="flex items-center justify-between px-4 py-4 lg:px-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
            Minha Biblioteca
          </h1>
          <p className="text-sm text-gray-500 mt-1 hidden sm:block">
            Suas histórias em um só lugar
          </p>
        </div>
        <Button
          variant="primary"
          className="text-sm px-4 py-2 rounded-xl"
          onClick={onCreateClick}
        >
          + Nova História
        </Button>
      </div>
    </header>
  );
}
