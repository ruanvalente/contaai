export type ReadingPosition = {
  scrollTop?: number;
  elementId?: string;
};

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  currentPosition: ReadingPosition;
  progressPercent: number;
  startedAt: string;
  finishedAt: string | null;
}

export type SaveReadingProgressInput = {
  userId: string;
  bookId: string;
  currentPosition: ReadingPosition;
  progressPercent: number;
};

export type ReadingProgressResult = 
  | { success: true; progress: ReadingProgress }
  | { success: false; error: string };