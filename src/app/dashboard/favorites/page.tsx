import { Suspense } from "react";
import { getUserFavorites, UserFavorite } from "@/features/book-dashboard/actions/user-favorites.actions";
import { FavoritesContent } from "@/features/book-dashboard/widgets/favorites-content.widget";
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
