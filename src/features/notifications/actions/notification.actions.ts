'use server';

import { toast } from 'sonner';
import type { NotificationType } from '../types/notification.types';

export interface LogErrorParams {
  error: unknown;
  context?: string;
  type?: NotificationType;
}

export interface LogActionParams<T = unknown> {
  action: () => Promise<T>;
  onSuccess?: string;
  onError?: string;
  context?: string;
}

export interface LogPromiseParams<T = unknown> {
  promise: Promise<T>;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

export async function logError({ error, context, type = 'error' }: LogErrorParams): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const contextPrefix = context ? `[${context}] ` : '';
  
  console.error(`${contextPrefix}${errorMessage}`);

  const toastFn = type === 'error' ? toast.error : type === 'warning' ? toast.warning : toast.info;
  toastFn(`${contextPrefix}${errorMessage}`);
}

export async function logWarning({ error, context }: LogErrorParams): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const contextPrefix = context ? `[${context}] ` : '';
  
  console.warn(`${contextPrefix}${errorMessage}`);
  toast.warning(`${contextPrefix}${errorMessage}`);
}

export async function logInfo({ error, context }: Omit<LogErrorParams, 'type'>): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const contextPrefix = context ? `[${context}] ` : '';
  
  console.info(`${contextPrefix}${errorMessage}`);
  toast.info(`${contextPrefix}${errorMessage}`);
}

export async function logAction<T>({ 
  action, 
  onSuccess = 'Operação realizada com sucesso', 
  onError = 'Ocorreu um erro',
  context 
}: LogActionParams<T>): Promise<T> {
  const contextPrefix = context ? `[${context}] ` : '';
  
  try {
    const result = await action();
    console.log(`${contextPrefix}${onSuccess}`);
    toast.success(onSuccess);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${contextPrefix}${errorMessage} - ${onError}`);
    toast.error(`${onError}: ${errorMessage}`);
    throw error;
  }
}

export async function logPromise<T>({
  promise,
  loadingMessage = 'Processando...',
  successMessage = 'Operação realizada com sucesso',
  errorMessage = 'Ocorreu um erro',
}: LogPromiseParams<T>): Promise<T> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (toast.promise(promise, {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
    }) as any);
    console.log(`[Success] ${successMessage}`);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Error] ${errorMessage}`);
    throw error;
  }
}

export function notifyClient(type: NotificationType, message: string): void {
  const toastFn = {
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
  }[type];
  
  toastFn(message);
}

export function promiseNotify<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return toast.promise(promise, messages) as any;
}