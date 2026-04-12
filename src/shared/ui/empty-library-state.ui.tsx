import { BookOpen } from "lucide-react";
import { Button } from "@/shared/ui/button.ui";
import { LibraryTab } from "@/features/library/hooks/use-library-tabs";

type EmptyLibraryStateProps = {
  tab: LibraryTab;
  onCreateClick: () => void;
};

const messages: Record<LibraryTab, string> = {
  "my-stories": "Você ainda não criou nenhuma história. Comece sua primeira obra!",
  reading: "Nenhuma história em andamento. Continue de onde parou!",
  completed: "Nenhuma história concluída ainda. Continue lendo!",
};

export function EmptyLibraryState({ tab, onCreateClick }: EmptyLibraryStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen className="w-10 h-10 text-gray-500" aria-hidden="true" />
      </div>
      <p className="text-gray-500 max-w-sm mx-auto">{messages[tab]}</p>
      {tab === "my-stories" && (
        <Button variant="primary" className="mt-4" onClick={onCreateClick}>
          Criar Primeira História
        </Button>
      )}
    </div>
  );
}
