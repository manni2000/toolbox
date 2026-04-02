import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export const toast = {
  success: ({ title = 'Success', description, duration = 3000 }: ToastOptions) => {
    sonnerToast.success(title, {
      description,
      duration,
    });
  },

  error: ({ title = 'Error', description, duration = 4000 }: ToastOptions) => {
    sonnerToast.error(title, {
      description,
      duration,
    });
  },

  info: ({ title = 'Info', description, duration = 3000 }: ToastOptions) => {
    sonnerToast.info(title, {
      description,
      duration,
    });
  },

  warning: ({ title = 'Warning', description, duration = 3500 }: ToastOptions) => {
    sonnerToast.warning(title, {
      description,
      duration,
    });
  },

  loading: ({ title = 'Loading...', description }: Omit<ToastOptions, 'duration'>) => {
    return sonnerToast.loading(title, {
      description,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  // Specialized feedback for common actions
  copied: (item = 'Text') => {
    sonnerToast.success(`${item} copied to clipboard`, {
      duration: 2000,
    });
  },

  downloaded: (fileName?: string) => {
    sonnerToast.success('Download started', {
      description: fileName ? `Downloading ${fileName}` : undefined,
      duration: 2500,
    });
  },

  fileProcessed: (action = 'processed') => {
    sonnerToast.success(`File ${action} successfully`, {
      duration: 2500,
    });
  },

  rateLimit: () => {
    sonnerToast.error('Too many requests', {
      description: 'Please wait a moment before trying again.',
      duration: 5000,
    });
  },

  offline: () => {
    sonnerToast.error('No internet connection', {
      description: 'Please check your connection and try again.',
      duration: 5000,
    });
  },
};
