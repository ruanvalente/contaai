import { Suspense } from "react";
import { getUserFavorites } from "@/infrastructure/api/favorites.actions";
import type { UserFavorite } from "@/infrastructure/api/favorites.actions";
import { FavoritesContent } from "@/features/book-dashboard";
import { PageSkeleton } from "@/shared/ui/skeleton.ui";

async function FavoritesData() {
  let favorites: UserFavorite[] = [];
  
  try {
    favorites = await getUserFavorites();
  } catch (error) {
    console.error("Error loading favorites:", error);
  }

  return (
    <FavoritesContent
      favorites={favorites}
    />
  );
}

export default function FavoritesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FavoritesData />
    </Suspense>
  );
}
