'use client';

import { ToastProvider } from '../ui/toast-provider.ui';

interface NotificationManagerProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  theme?: 'light' | 'dark' | 'system';
  visibleToasts?: number;
}

export function NotificationManager({
  position = 'bottom-center',
  theme = 'system',
  visibleToasts = 3,
}: NotificationManagerProps) {
  return (
    <ToastProvider
      position={position}
      theme={theme}
      visibleToasts={visibleToasts}
    />
  );
}