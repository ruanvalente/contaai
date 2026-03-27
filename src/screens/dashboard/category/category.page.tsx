import { Suspense } from "react";
import { getBooksPaginated, getCategories } from "@/features/book-dashboard/data/server-books";
import { CategoryContent } from "@/features/book-dashboard/widgets/category-content.widget";
import { PageSkeleton } from "@/shared/ui/skeleton.ui";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
  }>;
}

async function CategoryData({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const category = params.category || undefined;
  const search = params.search || undefined;

  const [{ books, total, totalPages }, categories] = await Promise.all([
    getBooksPaginated(page, 10, category, search),
    getCategories()
  ]);

  return (
    <CategoryContent 
      initialBooks={books} 
      categories={categories}
      serverPagination={{
        currentPage: page,
        totalPages,
        total
      }}
    />
  );
}

export default async function CategoryPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CategoryData searchParams={searchParams} />
    </Suspense>
  );
}