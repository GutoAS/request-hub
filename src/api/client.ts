import { currentAccessToken } from "../auth/accessToken";
import { ApiError } from "./ApiError";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(
  /\/$/,
  "",
);

type QueryValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH";

  query?: Record<string, QueryValue>;

  body?: unknown;

  signal?: AbortSignal;
}

let onUnauthorized: (() => void) | undefined;

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", query, body, signal } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  const token = await currentAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}${buildQueryString(query)}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    throw new ApiError(0, {
      detail: "Check your internet connection and try again.",
    });
  }

  if (!response.ok) {
    const apiError = new ApiError(response.status, await readProblem(response));
    if (apiError.isUnauthorized) onUnauthorized?.();
    throw apiError;
  }

  if (response.status === 204) {
    return undefined as T;
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(response.status, {
      title: "Unexpected response from the server",
      detail: "The server did not answer with JSON. Check VITE_API_BASE_URL.",
    });
  }
}

export function buildQueryString(
  query: Record<string, QueryValue> = {},
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.append(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

async function readProblem(response: Response) {
  try {
    const data: unknown = await response.json();
    return typeof data === "object" && data !== null ? data : {};
  } catch {
    return {};
  }
}
