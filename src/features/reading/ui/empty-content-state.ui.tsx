type EmptyContentStateProps = {
  message?: string;
};

export function EmptyContentState({ message = "Este livro ainda não possui conteúdo." }: EmptyContentStateProps) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
