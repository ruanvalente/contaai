import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
      <h2 className="text-6xl font-bold text-primary-200">404</h2>
      <p className="text-xl text-gray-500">Página não encontrada</p>
      <Link
        href="/"
        className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
      >
        Ir para o início
      </Link>
    </div>
  );
}
