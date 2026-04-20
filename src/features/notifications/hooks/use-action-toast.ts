'use client';

import { toast } from 'sonner';
import { useCallback } from 'react';

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
    messages: { confirm?: string; success?: string; error?: string } = {}
  ): Promise<boolean> => {
    const {
      confirm = 'Tem certeza que deseja continuar?',
      success = 'Operação realizada',
      error = 'Erro ao realizar operação',
    } = messages;

    const confirmed = window.confirm(confirm);

    if (!confirmed) return false;

    toast.promise(
      onConfirm().then((ok) => {
        if (!ok) throw new Error('Operação não realizada');
        return ok;
      }),
      {
        loading: 'Processando...',
        success: success,
        error: error,
      }
    );

    return true;
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
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}