import { ApiError } from "./ApiError";

export function errorMessageProps(error: unknown): {
  title: string;
  detail?: string;
  traceId?: string;
} {
  if (error instanceof ApiError && error.isForbidden) {
    return {
      title: "You don't have permission to do this.",
      detail: error.detail ?? "Ask an administrator for access.",
      traceId: error.traceId,
    };
  }
  if (error instanceof ApiError) {
    return { title: error.title, detail: error.detail, traceId: error.traceId };
  }
  return {
    title: "Something went wrong",
    detail: "An unexpected error occurred. Try again later.",
  };
}
