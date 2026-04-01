export type { ReadingMode, ReadingPreferences } from "@/features/profile/reading/hooks/use-reading-preferences";

export type ReadingProgress = {
  bookId: string;
  progressPercent: number;
  scrollTop: number;
  elementId?: string;
  startedAt?: Date;
  finishedAt?: Date;
};

export type ReadingProgressDB = {
  id: string;
  user_id: string;
  book_id: string;
  current_position: {
    scrollTop?: number;
    elementId?: string;
  };
  progress_percent: number;
  started_at: string;
  finished_at: string | null;
};

export type ReadingSession = {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl?: string;
  bookCoverColor: string;
  bookContent?: string;
  wordCount: number;
  progress: ReadingProgress | null;
  isLoaded: boolean;
};
