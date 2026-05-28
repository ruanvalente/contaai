'use client';

import { toast } from '@/features/notifications';
import { useCallback } from 'react';
import type { ActionResult } from '@/shared/types/action-result';
import { failure } from '@/shared/types/action-result';

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
      
      if (result.ok) {
        toast.dismiss();
        toast.success(successMessage);
      } else {
        toast.dismiss();
        toast.error(result.error.message || errorMessage);
      }
      
      return result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro interno';
      toast.dismiss();
      toast.error(msg);
      return failure("UNKNOWN", msg);
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
                toast.dismiss();
                toast.success(success);
              } else {
                toast.dismiss();
                toast.error(error);
              }
            } catch {
              toast.dismiss();
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