import { Container } from "@/shared/ui/container.ui";

export default function ExploreLoading() {
  return (
    <main className="min-h-screen bg-primary-200">
      <section className="py-20">
        <Container>
          <div className="text-center mb-8">
            <div className="h-8 w-64 bg-gray-300 rounded animate-pulse mx-auto" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mx-auto mt-4" />
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 w-20 bg-gray-300 rounded-full animate-pulse" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 rounded-lg w-full aspect-[2/3]" />
                <div className="mt-2 h-4 bg-gray-300 rounded w-3/4" />
                <div className="mt-1 h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
