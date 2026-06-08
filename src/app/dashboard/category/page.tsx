import type { PageProps } from "@/shared/types/next.types";
import CategoryPage from "@/features/discovery/pages/category.page";

export default function Page({ searchParams }: PageProps<Record<string, string>, { page?: string; category?: string; search?: string }>) {
  return <CategoryPage searchParams={searchParams} />;
}
