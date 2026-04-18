"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY_PREFIX = "conta-ai-editor-backup-";
const BACKUP_TTL_MS = 24 * 60 * 60 * 1000;

function getNow(): number {
  return Date.now();
}

type BackupData = {
  content: string;
  timestamp: number;
  title: string;
}

type UseEditorBackupOptions = {
  bookId: string;
  enabled?: boolean;
}

type UseEditorBackupReturn = {
  backupData: BackupData | null;
  hasBackup: boolean;
  saveBackup: (content: string, title?: string) => void;
  clearBackup: () => void;
  isBackupExpired: boolean;
}

function loadBackupFromStorage(storageKey: string): BackupData | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    const data: BackupData = JSON.parse(stored);
    return data;
  } catch {
    return null;
  }
}

function isExpired(timestamp: number): boolean {
  return getNow() - timestamp > BACKUP_TTL_MS;
}

export function useEditorBackup({
  bookId,
  enabled = true,
}: UseEditorBackupOptions): UseEditorBackupReturn {
  const storageKey = `${STORAGE_KEY_PREFIX}${bookId}`;

  const [backupData, setBackupData] = useState<BackupData | null>(() => {
    if (!enabled) return null;
    const data = loadBackupFromStorage(storageKey);
    if (data && isExpired(data.timestamp)) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(storageKey);
      }
      return null;
    }
    return data;
  });

  const saveBackup = useCallback(
    (content: string, title?: string) => {
      if (!enabled || typeof window === "undefined") return;

      try {
        const data: BackupData = {
          content,
          timestamp: Date.now(),
          title: title || "",
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
        setBackupData(data);
      } catch (error) {
        console.error("Failed to save backup to localStorage:", error);
      }
    },
    [enabled, storageKey]
  );

  const clearBackup = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(storageKey);
      setBackupData(null);
    } catch (error) {
      console.error("Failed to clear backup from localStorage:", error);
    }
  }, [storageKey]);

  const isBackupExpired = backupData ? isExpired(backupData.timestamp) : false;

  return {
    backupData,
    hasBackup: backupData !== null && !isBackupExpired,
    saveBackup,
    clearBackup,
    isBackupExpired,
  };
}