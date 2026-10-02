import { HttpResponse } from "msw";
import type { ProblemDetails } from "../api/types";

export function problem(
  request: Request,
  status: number,
  title: string,
  detail: string,
  extra: Record<string, unknown> = {},
  headers: Record<string, string> = {},
) {
  const slug = PROBLEM_TYPES[status] ?? "error";
  const body: ProblemDetails = {
    type: `https://api.example.test/problems/${slug}`,
    title,
    status,
    detail,
    instance: new URL(request.url).pathname,
    traceId: fakeTraceId(),
    ...extra,
  };

  return HttpResponse.json(body, {
    status,
    headers: { "Content-Type": "application/problem+json", ...headers },
  });
}

const PROBLEM_TYPES: Record<number, string> = {
  400: "bad-request",
  401: "unauthorized",
  403: "forbidden",
  404: "not-found",
  409: "version-conflict",
  422: "validation-error",
  500: "internal-error",
};

function fakeTraceId(): string {
  return Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}
