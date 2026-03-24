import { ReactNode } from "react";

type ProfileFormUIProps = {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitDisabled: boolean;
  isPending: boolean;
  isCancelDisabled: boolean;
  onCancel: () => void;
};

export function ProfileFormUI({
  children,
  onSubmit,
  isSubmitDisabled,
  isPending,
  isCancelDisabled,
  onCancel,
}: ProfileFormUIProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {children}

      <div className="flex gap-3 pt-4 border-t border-primary-200">
        <button
          type="submit"
          disabled={isSubmitDisabled || isPending}
          className="px-6 py-2.5 bg-accent-500 text-white rounded-xl font-medium hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Salvando..." : "Salvar Alterações"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isCancelDisabled || isPending}
          className="px-6 py-2.5 border border-primary-300 text-gray-700 rounded-xl font-medium hover:bg-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
