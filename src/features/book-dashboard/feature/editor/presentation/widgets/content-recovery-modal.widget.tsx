"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RotateCcw, X, Clock } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/utils/cn";

interface ContentRecoveryModalProps {
  isOpen: boolean;
  onRecover: () => void;
  onDiscard: () => void;
  backupTimestamp?: number;
  backupTitle?: string;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "agora mesmo";
  if (diffMins < 60) return `${diffMins} minuto${diffMins > 1 ? "s" : ""} atrás`;
  if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? "s" : ""} atrás`;
  return `${diffDays} dia${diffDays > 1 ? "s" : ""} atrás`;
}

export function ContentRecoveryModal({
  isOpen,
  onRecover,
  onDiscard,
  backupTimestamp,
  backupTitle,
}: ContentRecoveryModalProps) {
  const [selectedOption, setSelectedOption] = useState<"recover" | "discard">(
    "recover"
  );

  const handleRecover = () => {
    onRecover();
  };

  const handleDiscard = () => {
    onDiscard();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className={cn(
              "bg-white rounded-2xl w-full max-w-md overflow-hidden",
              "shadow-2xl"
            )}
          >
            <div className="bg-amber-50 p-4 flex items-center gap-3 border-b border-amber-100">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  Recuperar conteúdo?
                </h2>
                <p className="text-sm text-gray-600">
                  encontramos uma versão salva do seu trabalho
                </p>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {backupTimestamp && (
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>
                    Salvo {formatTimestamp(backupTimestamp)}
                    {backupTitle && ` • "${backupTitle}"`}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={() => setSelectedOption("recover")}
                  className={cn(
                    "w-full p-3 rounded-lg border-2 text-left transition-all",
                    selectedOption === "recover"
                      ? "border-accent-500 bg-accent-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        selectedOption === "recover"
                          ? "border-accent-500 bg-accent-500"
                          : "border-gray-300"
                      )}
                    >
                      {selectedOption === "recover" && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Recuperar conteúdo
                      </p>
                      <p className="text-sm text-gray-500">
                        Restaurar a versão salva do localStorage
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedOption("discard")}
                  className={cn(
                    "w-full p-3 rounded-lg border-2 text-left transition-all",
                    selectedOption === "discard"
                      ? "border-gray-400 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        selectedOption === "discard"
                          ? "border-gray-400 bg-gray-400"
                          : "border-gray-300"
                      )}
                    >
                      {selectedOption === "discard" && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <X className="w-4 h-4" />
                        Descartar
                      </p>
                      <p className="text-sm text-gray-500">
                        Manter a versão do banco de dados
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <Button
                variant="secondary"
                onClick={handleDiscard}
                className="flex-1"
              >
                Descartar
              </Button>
              <Button
                variant="primary"
                onClick={handleRecover}
                className="flex-1"
              >
                Recuperar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
