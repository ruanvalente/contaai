import CategoryPage from "@/features/discovery/pages/category.page";

export default function Page({ searchParams }: { searchParams: Promise<{ page?: string; category?: string; search?: string }> }) {
  return <CategoryPage searchParams={searchParams} />;
}
