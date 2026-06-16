import { useState, useCallback } from "react";

interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

interface UploadProgress {
  isLoading: boolean;
  error: Error | null;
  progress: number; // 0-100
}

export const useUploadWithRetry = (config: RetryConfig = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = config;

  const [progress, setProgress] = useState<UploadProgress>({
    isLoading: false,
    error: null,
    progress: 0,
  });

  const executeWithRetry = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      let lastError: Error | null = null;
      let delay = initialDelay;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          setProgress({ isLoading: true, error: null, progress: 0 });
          const result = await fn();
          setProgress({ isLoading: false, error: null, progress: 100 });
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error("Unknown error");
          const isLastAttempt = attempt === maxRetries;

          if (isLastAttempt) {
            setProgress({
              isLoading: false,
              error: lastError,
              progress: 0,
            });
          } else {
            // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay = Math.min(delay * backoffMultiplier, maxDelay);
          }
        }
      }

      throw lastError;
    },
    [maxRetries, initialDelay, maxDelay, backoffMultiplier]
  );

  return { ...progress, executeWithRetry };
};
