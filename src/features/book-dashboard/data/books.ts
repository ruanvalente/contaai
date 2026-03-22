import { Book, BookListItem } from "../types/book.types";

export const mockBooks: Book[] = [
  {
    id: "1",
    title: "O Último Suspiro",
    author: "Maria Silva",
    coverColor: "#8B4513",
    description:
      "Uma jornada emocional através das memórias de uma família que enfrenta os desafios do tempo. Entre perdas e reencontros, os personagens descobrem que o amor é a única força que realmente importa.",
    category: "Drama",
    pages: 320,
    rating: 4.5,
    ratingCount: 234,
    reviewCount: 89,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "Noites de Luar",
    author: "João Pedro",
    coverColor: "#2F4F4F",
    description:
      "Em um mundo onde a magia e a tecnologia coexistem, uma jovem bruxa precisa decidir seu destino entre dois mundos rivais. Uma aventura cheia de mistérios e descobertas.",
    category: "Fantasy",
    pages: 412,
    rating: 4.8,
    ratingCount: 567,
    reviewCount: 234,
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "3",
    title: "Fragmentos do Amanhã",
    author: "Ana Clara",
    coverColor: "#800020",
    description:
      "Num futuro distante, a humanidade colonizou Marte. Mas quando uma descoberta científica ameaça o equilíbrio da nova civilização, um grupo de astronautas embarca em uma missão perigosa.",
    category: "Sci-Fi",
    pages: 380,
    rating: 4.3,
    ratingCount: 189,
    reviewCount: 67,
    createdAt: new Date("2024-03-10"),
  },
  {
    id: "4",
    title: "O Caminho do Sucesso",
    author: "Ricardo Borges",
    coverColor: "#1E3A5F",
    description:
      "Um guia prático para alcançar seus objetivos profissionais e pessoais. Baseado em histórias reais de empreendedores que transformaram desafios em oportunidades.",
    category: "Business",
    pages: 256,
    rating: 4.1,
    ratingCount: 445,
    reviewCount: 156,
    createdAt: new Date("2024-01-28"),
  },
  {
    id: "5",
    title: "Travessias",
    author: "Carla Mendes",
    coverColor: "#4A4A4A",
    description:
      "Uma coletânea de contos que exploram a condição humana em suas múltiplas dimensões. Histórias de amor, perda, redenção e esperança que tocam o coração.",
    category: "Drama",
    pages: 298,
    rating: 4.6,
    ratingCount: 321,
    reviewCount: 112,
    createdAt: new Date("2024-04-05"),
  },
  {
    id: "6",
    title: "Além das Estrelas",
    author: "Pedro Henrique",
    coverColor: "#4B0082",
    description:
      "Uma expedição científica revela sinais de vida em um planeta distante. O que parecia ser o maior feito da humanidade rapidamente se torna uma ameaça existencial.",
    category: "Sci-Fi",
    pages: 445,
    rating: 4.7,
    ratingCount: 623,
    reviewCount: 278,
    createdAt: new Date("2024-02-14"),
  },
  {
    id: "7",
    title: "O Reino Encantado",
    author: "Fernanda Costa",
    coverColor: "#228B22",
    description:
      "Quando um jovem príncipe herda um reino em ruínas, ele deve encontrar três artefatos mágicos para restaurar a paz. Uma aventura épica cheia de criaturas fantásticas.",
    category: "Fantasy",
    pages: 512,
    rating: 4.4,
    ratingCount: 456,
    reviewCount: 189,
    createdAt: new Date("2024-03-22"),
  },
  {
    id: "8",
    title: "Geografia Global",
    author: "Marcos Oliveira",
    coverColor: "#CD853F",
    description:
      "Uma exploração abrangente dos fenômenos geográficos que moldam nosso planeta. Com ilustrações detalhadas e mapas atualizados.",
    category: "Geography",
    pages: 342,
    rating: 4.2,
    ratingCount: 234,
    reviewCount: 78,
    createdAt: new Date("2024-01-08"),
  },
  {
    id: "9",
    title: "Métodos de Aprendizagem",
    author: "Juliana Santos",
    coverColor: "#6B8E23",
    description:
      "Descubra técnicas comprovadas cientificamente para melhorar sua memória, concentração e capacidade de aprendizado. Ideal para estudantes e profissionais.",
    category: "Education",
    pages: 224,
    rating: 4.0,
    ratingCount: 567,
    reviewCount: 234,
    createdAt: new Date("2024-02-28"),
  },
  {
    id: "10",
    title: "A Arte da Negociação",
    author: "Roberto Almeida",
    coverColor: "#8B0000",
    description:
      "Aprenda os segredos das negociações bem-sucedidas com estratégias utilizadas por diplomatas e executivos de sucesso ao redor do mundo.",
    category: "Business",
    pages: 288,
    rating: 4.5,
    ratingCount: 789,
    reviewCount: 345,
    createdAt: new Date("2024-04-12"),
  },
  {
    id: "11",
    title: "Mundos Paralelos",
    author: "Lucas Ferreira",
    coverColor: "#483D8B",
    description:
      "Um físico descobre como viajar entre realidades alternativas. Mas cada decisão em um mundo afeta o outro, e o equilibrio entre dimensões está em risco.",
    category: "Sci-Fi",
    pages: 398,
    rating: 4.6,
    ratingCount: 412,
    reviewCount: 167,
    createdAt: new Date("2024-03-18"),
  },
  {
    id: "12",
    title: "Lendas do Norte",
    author: "Sofia Rodrigues",
    coverColor: "#2F4F4F",
    description:
      "Vikings, deuses nórdicos e aventuras épicas se encontram nesta narrativa que transporta o leitor para tempos ancestrais repletos de coragem.",
    category: "Fantasy",
    pages: 456,
    rating: 4.9,
    ratingCount: 534,
    reviewCount: 223,
    createdAt: new Date("2024-04-01"),
  },
];

export const featuredBooks: Book[] = mockBooks.slice(0, 4);

export function filterBooksByCategory(
  books: Book[],
  category: string
): Book[] {
  if (category === "All") return books;
  return books.filter((book) => book.category === category);
}

export function searchBooks(books: Book[], query: string): Book[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return books;

  return books.filter(
    (book) =>
      book.title.toLowerCase().includes(normalizedQuery) ||
      book.author.toLowerCase().includes(normalizedQuery) ||
      book.category.toLowerCase().includes(normalizedQuery)
  );
}

export function getBookListItems(books: Book[]): BookListItem[] {
  return books.map(({ id, title, author, coverUrl, coverColor, category, rating }) => ({
    id,
    title,
    author,
    coverUrl,
    coverColor,
    category,
    rating,
  }));
}
