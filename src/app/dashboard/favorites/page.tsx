import { Suspense } from "react";
import { getUserFavorites } from "@/features/discovery/actions/favorites.actions";
import type { UserFavorite } from "@/features/discovery/actions/favorites.actions";
import { FavoritesContent } from "@/features/library/widgets/favorites-content.widget";
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
