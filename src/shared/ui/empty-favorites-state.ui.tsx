import { Heart } from "lucide-react";

type EmptyFavoritesStateProps = {
  searchQuery?: string;
};

export function EmptyFavoritesState({ searchQuery }: EmptyFavoritesStateProps) {
  if (searchQuery) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          Nenhum favorito encontrado para &quot;{searchQuery}&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Heart className="w-10 h-10 text-gray-500" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Nenhum favorito
      </h3>
      <p className="text-gray-500 max-w-sm mx-auto">
        Adicione histórias aos favoritos para encontrá-las facilmente depois.
      </p>
    </div>
  );
}
