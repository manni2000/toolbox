import { useState, useEffect } from 'react';

interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

interface UseApiRetryResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isRetrying: boolean;
  retryCount: number;
  refetch: () => Promise<void>;
}

/**
 * Hook for API calls with exponential backoff retry logic
 */
export function useApiRetry<T>(
  fetchFn: () => Promise<T>,
  config: RetryConfig = {}
): UseApiRetryResult<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = config;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const executeWithRetry = async (attempt = 0): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      setRetryCount(0);
      setIsRetrying(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (attempt < maxRetries) {
        setIsRetrying(true);
        setRetryCount(attempt + 1);
        
        const delay = Math.min(
          initialDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );
        
        onRetry?.(attempt + 1, error);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry(attempt + 1);
      } else {
        setError(error);
        setIsRetrying(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => executeWithRetry(0);

  useEffect(() => {
    executeWithRetry(0);
  }, []);

  return {
    data,
    error,
    isLoading,
    isRetrying,
    retryCount,
    refetch,
  };
}

/**
 * Utility function for one-off API calls with retry
 */
export async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = config;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      if (attempt < maxRetries) {
        const delay = Math.min(
          initialDelay * Math.pow(backoffMultiplier, attempt),
          maxDelay
        );
        
        onRetry?.(attempt + 1, lastError);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  
  // Check for network errors
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return true;
  }
  
  // Check for HTTP status codes (if available)
  const statusMatch = error.message.match(/status (\d+)/);
  if (statusMatch) {
    const status = parseInt(statusMatch[1]);
    return retryableStatusCodes.includes(status);
  }
  
  return false;
}

/**
 * Hook for checking online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
