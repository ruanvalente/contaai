export default function RootLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-primary-200 rounded w-48" />
        <div className="h-4 bg-primary-200 rounded w-96" />
      </div>
    </div>
  );
}
