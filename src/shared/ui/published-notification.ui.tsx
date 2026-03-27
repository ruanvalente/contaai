import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Pencil } from "lucide-react";

type PublishedNotificationProps = {
  bookId: string;
};

export function PublishedNotification({ bookId }: PublishedNotificationProps) {
  const router = useRouter();

  return (
    <div className="bg-green-50 border-b border-green-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <p className="text-sm text-green-700">
          🎉 Livro publicado com sucesso! Agora você pode editá-lo ou continuar criando novas histórias.
        </p>
        <Button
          variant="secondary"
          className="text-xs bg-green-100 hover:bg-green-200 border-green-300"
          onClick={() => router.push(`/dashboard/editor/${bookId}`)}
        >
          <Pencil className="w-3 h-3 mr-1" />
          Editar
        </Button>
      </div>
    </div>
  );
}
