'use client';

import { Toaster } from 'sonner';

interface ToastProviderProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  theme?: 'light' | 'dark' | 'system';
  visibleToasts?: number;
}

export function ToastProvider({
  position = 'top-right',
  theme = 'dark',
  visibleToasts = 3,
}: ToastProviderProps) {
  return (
    <Toaster
      position={position}
      theme={theme}
      visibleToasts={visibleToasts}
      richColors
      toastOptions={{
        style: {
          background: '#1a1a2e',
          color: '#fff',
          border: '1px solid #2d2d4a',
        },
      }}
    />
  );
}