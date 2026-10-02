import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./ApiError";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError;
  }
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => failureCount < 1 && shouldRetry(error),
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function shouldRetry(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return error.isNetworkError || error.status >= 500;
}
