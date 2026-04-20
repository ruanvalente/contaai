'use client';

import { toast } from 'sonner';
import type { NotificationType, NotificationPayload } from '../types/notification.types';
import { NOTIFICATION_MESSAGES } from '../types/notification.types';

type ToastMethod = 'success' | 'error' | 'warning' | 'info';

const getToastFunction = (type: NotificationType): typeof toast.success => {
  const methods: Record<NotificationType, typeof toast.success> = {
    success: toast.success,
    error: toast.error,
    warning: toast.warning,
    info: toast.info,
  };
  return methods[type];
};

const displayNotification = (
  message: string,
  type: NotificationType,
  title?: string
) => {
  const toastFn = getToastFunction(type);
  toastFn(title ? `${title}: ${message}` : message);
};

export function useNotification() {
  const notify = (
    payload: NotificationPayload,
    category?: keyof typeof NOTIFICATION_MESSAGES
  ) => {
    const { message, type = 'info', title } = payload;

    if (category && NOTIFICATION_MESSAGES[category]) {
      const categoryMessages = NOTIFICATION_MESSAGES[category] as Record<string, string>;
      const translatedMessage = categoryMessages[message as keyof typeof categoryMessages] || message;
      displayNotification(translatedMessage, type, title);
    } else {
      displayNotification(message, type, title);
    }
  };

  const success = (message: string, title?: string) => {
    displayNotification(message, 'success', title);
  };

  const error = (message: string, title?: string) => {
    displayNotification(message, 'error', title);
  };

  const warning = (message: string, title?: string) => {
    displayNotification(message, 'warning', title);
  };

  const info = (message: string, title?: string) => {
    displayNotification(message, 'info', title);
  };

  const promise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  };

  return {
    notify,
    success,
    error,
    warning,
    info,
    promise,
  };
}

export { NOTIFICATION_MESSAGES };