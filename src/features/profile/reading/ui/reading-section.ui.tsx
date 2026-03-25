import { ReactNode } from "react";

type ReadingSectionUIProps = {
  children: ReactNode;
  isSaveDisabled: boolean;
  isPending: boolean;
  isCancelDisabled: boolean;
  onSave: () => void;
  onCancel: () => void;
};

export function ReadingSectionUI({
  children,
  isSaveDisabled,
  isPending,
  isCancelDisabled,
  onSave,
  onCancel,
}: ReadingSectionUIProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Preferências de Leitura</h2>
      
      <div className="space-y-4">
        {children}
      </div>

      <div className="flex gap-3 pt-4 border-t border-primary-200">
        <button
          onClick={onSave}
          disabled={isSaveDisabled || isPending}
          className="px-6 py-2.5 bg-accent-500 text-white rounded-xl font-medium hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Salvando..." : "Salvar Alterações"}
        </button>
        <button
          onClick={onCancel}
          disabled={isCancelDisabled || isPending}
          className="px-6 py-2.5 border border-primary-300 text-gray-700 rounded-xl font-medium hover:bg-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
