'use client';

import { toast } from '@/features/notifications';
import { useCallback, useState } from 'react';

export type ActionResult<T = unknown> = 
  | { success: true; data?: T }
  | { success: false; error?: string };

export interface ActionOptions {
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

export function useActionToast() {
  const withToast = useCallback(async <T,>(
    promise: Promise<ActionResult<T>>,
    messages: ActionOptions = {}
  ): Promise<ActionResult<T>> => {
    const {
      loadingMessage = 'Processando...',
      successMessage = 'Operação realizada com sucesso',
      errorMessage = 'Ocorreu um erro',
    } = messages;

    toast.loading(loadingMessage);

    try {
      const result = await promise;
      
      if (result.success) {
        toast.success(successMessage);
      } else {
        toast.error(result.error || errorMessage);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro interno';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const withConfirm = useCallback(async (
    message: string,
    onConfirm: () => Promise<boolean>,
    messages: { success?: string; error?: string } = {}
  ): Promise<boolean> => {
    const {
      success = 'Operação realizada',
      error = 'Erro ao realizar operação',
    } = messages;

    return new Promise((resolve) => {
      toast.error(message, {
        duration: Infinity,
        action: {
          label: 'Confirmar',
          onClick: async () => {
            toast.loading('Processando...');
            try {
              const ok = await onConfirm();
              if (ok) {
                toast.success(success);
                resolve(true);
              } else {
                toast.error(error);
                resolve(false);
              }
            } catch {
              toast.error(error);
              resolve(false);
            }
          },
        },
        cancel: {
          label: 'Cancelar',
          onClick: () => {
            resolve(false);
          },
        },
      });
    });
  }, []);

  const showPromise = useCallback(<T,>(
    promise: Promise<T>,
    messages: { loading?: string; success?: string; error?: string }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Processando...',
      success: messages.success || 'Sucesso',
      error: messages.error || 'Erro',
    });
  }, []);

  const showSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const showError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const showWarning = useCallback((message: string) => {
    toast.warning(message);
  }, []);

  const showInfo = useCallback((message: string) => {
    toast.info(message);
  }, []);

  return {
    withToast,
    withConfirm,
    showPromise,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}