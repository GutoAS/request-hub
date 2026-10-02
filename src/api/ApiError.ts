import type { ProblemDetails } from "./types";

export class ApiError extends Error {
  readonly status: number;

  readonly title: string;

  readonly detail?: string;

  readonly traceId?: string;

  readonly type?: string;

  readonly fieldErrors: Record<string, string[]>;

  constructor(
    status: number,
    problem: Partial<ProblemDetails> & { errors?: unknown } = {},
  ) {
    const title = problem.title ?? defaultTitle(status);
    super(problem.detail ? `${title}: ${problem.detail}` : title);
    this.name = "ApiError";
    this.status = status;
    this.title = title;
    this.detail = problem.detail;
    this.traceId = problem.traceId;
    this.type = problem.type;
    this.fieldErrors = toFieldErrors(problem.errors);
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isConflict() {
    return this.status === 409;
  }

  get isValidationError() {
    return this.status === 422;
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

function defaultTitle(status: number): string {
  if (status === 0) return "Cannot reach the server";
  if (status === 401) return "Unauthorized";
  if (status === 403) return "Forbidden";
  if (status === 404) return "Not found";
  if (status >= 500) return "Something went wrong";
  return "Request failed";
}

function toFieldErrors(errors: unknown): Record<string, string[]> {
  if (typeof errors !== "object" || errors === null) return {};
  const result: Record<string, string[]> = {};
  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages)) {
      result[field] = messages.filter(
        (message): message is string => typeof message === "string",
      );
    }
  }
  return result;
}
