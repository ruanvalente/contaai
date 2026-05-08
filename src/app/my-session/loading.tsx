import { Container } from '@/shared/ui/container.ui'

export default function Loading() {
  return (
    <main className="min-h-screen bg-primary-200">
      <Container className="py-20">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-primary-300 rounded-xl" />
          <div className="h-10 bg-primary-300 rounded-lg w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-primary-300 rounded-xl" />
            ))}
          </div>
        </div>
      </Container>
    </main>
  )
}
