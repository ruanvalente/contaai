export function ReadingSkeleton() {
  return (
    <div className="min-h-screen bg-primary-50 animate-pulse">
      <div className="h-14 bg-white border-b border-primary-200" />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-10 w-2/3 bg-primary-200 rounded-lg mb-4" />
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl mb-8">
          <div className="w-10 h-10 bg-primary-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 w-24 bg-primary-200 rounded" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 w-full bg-primary-200 rounded" />
          <div className="h-4 w-5/6 bg-primary-200 rounded" />
          <div className="h-4 w-4/6 bg-primary-200 rounded" />
        </div>
      </div>
    </div>
  );
}
