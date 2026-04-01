type BookMetadataProps = {
  wordCount: number;
  locale?: string;
};

export function BookMetadata({ wordCount, locale = "pt-BR" }: BookMetadataProps) {
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="mb-6 flex items-center justify-between text-sm text-gray-500">
      <span>{wordCount.toLocaleString(locale)} palavras</span>
      <span>{readingTime} min de leitura</span>
    </div>
  );
}
