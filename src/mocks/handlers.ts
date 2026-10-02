import { delay, http, HttpResponse } from "msw";
import {
  SERVICE_REQUEST_PRIORITIES,
  SERVICE_REQUEST_SORTS,
  SERVICE_REQUEST_STATUSES,
  type CreateServiceRequest,
  type ServiceRequest,
  type ServiceRequestPage,
  type ServiceRequestPriority,
  type ServiceRequestSort,
  type ServiceRequestStatus,
} from "../api/types";
import { canTransition } from "../features/requests/transitions";
import { STATUS_LABELS } from "../features/requests/labels";
import { db } from "./db";
import { problem } from "./problem";

const API = "*/api";

const LATENCY_MS = import.meta.env.MODE === "test" ? 0 : 400;

export const handlers = [
  http.get(`${API}/requests`, async ({ request }) => {
    await delay(LATENCY_MS);
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const params = new URL(request.url).searchParams;
    const parsed = parseListParams(params);
    if ("error" in parsed) {
      return problem(request, 400, "Invalid request", parsed.error);
    }
    const { search, status, priority, sort, page, pageSize } = parsed;

    let items = db.all();
    if (search) {
      const needle = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(needle) ||
          item.requesterName.toLowerCase().includes(needle),
      );
    }
    if (status) items = items.filter((item) => item.status === status);
    if (priority) items = items.filter((item) => item.priority === priority);

    items = sortRequests(items, sort);

    const total = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const body: ServiceRequestPage = {
      items: items.slice(start, start + pageSize),
      page,
      pageSize,
      total,
      totalPages,
    };
    return HttpResponse.json(body);
  }),

  http.post(`${API}/requests`, async ({ request }) => {
    await delay(LATENCY_MS);
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const body = await readJson(request);
    if (!isPlainObject(body)) {
      return problem(
        request,
        400,
        "Invalid request",
        "The request body must be a JSON object.",
      );
    }

    const unknownField = Object.keys(body).find(
      (key) => !CREATE_FIELDS.includes(key),
    );
    if (unknownField) {
      return problem(
        request,
        400,
        "Invalid request",
        `Field '${unknownField}' is not allowed in this request.`,
      );
    }

    const errors = validateCreate(body);
    if (Object.keys(errors).length > 0) {
      return problem(
        request,
        422,
        "Validation failed",
        "The submitted service request contains invalid fields.",
        {
          errors,
        },
      );
    }

    const created = db.create(body as unknown as CreateServiceRequest);
    return HttpResponse.json(created, {
      status: 201,
      headers: { Location: `/api/requests/${created.id}` },
    });
  }),

  http.get(`${API}/requests/:requestId`, async ({ request, params }) => {
    await delay(LATENCY_MS);
    const unauthorized = requireAuth(request);
    if (unauthorized) return unauthorized;

    const id = String(params.requestId);
    const found = db.find(id);
    if (!found) {
      return problem(
        request,
        404,
        "Service request not found",
        `No service request exists with id ${id}.`,
      );
    }
    return HttpResponse.json(found);
  }),

  http.patch(
    `${API}/requests/:requestId/status`,
    async ({ request, params }) => {
      await delay(LATENCY_MS);
      const unauthorized = requireAuth(request);
      if (unauthorized) return unauthorized;

      const id = String(params.requestId);
      const body = await readJson(request);
      if (
        !isPlainObject(body) ||
        !isOneOf(body.status, SERVICE_REQUEST_STATUSES) ||
        !Number.isInteger(body.version) ||
        (body.version as number) < 1
      ) {
        return problem(
          request,
          400,
          "Invalid request",
          "The body must contain a valid 'status' and a 'version' of 1 or more.",
        );
      }
      const newStatus = body.status as ServiceRequestStatus;
      const note = body.note;

      const current = db.find(id);
      if (!current) {
        return problem(
          request,
          404,
          "Service request not found",
          `No service request exists with id ${id}.`,
        );
      }

      if (body.version !== current.version) {
        return problem(
          request,
          409,
          "Update conflict",
          "The request was updated by someone else. Refresh and try again.",
        );
      }

      if (
        note !== undefined &&
        (typeof note !== "string" || note.length > 500)
      ) {
        return problem(
          request,
          422,
          "Validation failed",
          "The note is invalid.",
          {
            errors: { note: ["Note must be 500 characters or fewer."] },
          },
        );
      }

      if (!canTransition(current.status, newStatus)) {
        const detail =
          current.status === "CLOSED"
            ? "A CLOSED request cannot be reopened."
            : `A request that is ${STATUS_LABELS[current.status]} cannot move to ${STATUS_LABELS[newStatus]}.`;
        return problem(request, 422, "Invalid status transition", detail, {
          errors: {
            status: [
              `Transition from ${current.status} to ${newStatus} is not allowed.`,
            ],
          },
        });
      }

      return HttpResponse.json(db.updateStatus(id, newStatus));
    },
  ),
];

function requireAuth(request: Request) {
  const header = request.headers.get("Authorization");
  if (header?.startsWith("Bearer ") && header.length > "Bearer ".length) {
    return null;
  }
  return problem(
    request,
    401,
    "Unauthorized",
    "The access token is missing or has expired. Sign in again.",
    {},
    {
      "WWW-Authenticate":
        'Bearer realm="service-requests", error="invalid_token"',
    },
  );
}

const LIST_PARAMS = [
  "search",
  "status",
  "priority",
  "sort",
  "page",
  "pageSize",
];

interface ParsedListParams {
  search?: string;
  status?: ServiceRequestStatus;
  priority?: ServiceRequestPriority;
  sort: ServiceRequestSort;
  page: number;
  pageSize: number;
}

function parseListParams(
  params: URLSearchParams,
): ParsedListParams | { error: string } {
  for (const key of params.keys()) {
    if (!LIST_PARAMS.includes(key)) {
      return { error: `Unknown query parameter '${key}'.` };
    }
  }

  const search = params.get("search") ?? undefined;
  if (search !== undefined && search.length > 100) {
    return {
      error: "Query parameter 'search' must be 100 characters or fewer.",
    };
  }

  const status = params.get("status") ?? undefined;
  if (status !== undefined && !isOneOf(status, SERVICE_REQUEST_STATUSES)) {
    return {
      error: `Query parameter 'status' must be one of ${SERVICE_REQUEST_STATUSES.join(", ")}.`,
    };
  }

  const priority = params.get("priority") ?? undefined;
  if (
    priority !== undefined &&
    !isOneOf(priority, SERVICE_REQUEST_PRIORITIES)
  ) {
    return {
      error: `Query parameter 'priority' must be one of ${SERVICE_REQUEST_PRIORITIES.join(", ")}.`,
    };
  }

  const sort = params.get("sort") ?? "-createdAt";
  if (!isOneOf(sort, SERVICE_REQUEST_SORTS)) {
    return {
      error: `Query parameter 'sort' must be one of ${SERVICE_REQUEST_SORTS.join(", ")}.`,
    };
  }

  const page = toInteger(params.get("page") ?? "1");
  if (page === null || page < 1) {
    return { error: "Query parameter 'page' must be 1 or more." };
  }

  const pageSize = toInteger(params.get("pageSize") ?? "10");
  if (pageSize === null || pageSize < 1 || pageSize > 100) {
    return { error: "Query parameter 'pageSize' must be between 1 and 100." };
  }

  return {
    search,
    status: status as ServiceRequestStatus | undefined,
    priority: priority as ServiceRequestPriority | undefined,
    sort: sort as ServiceRequestSort,
    page,
    pageSize,
  };
}

const PRIORITY_RANK: Record<ServiceRequestPriority, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

function sortRequests(
  items: ServiceRequest[],
  sort: ServiceRequestSort,
): ServiceRequest[] {
  const descending = sort.startsWith("-");
  const field = descending ? sort.slice(1) : sort;

  const compare = (a: ServiceRequest, b: ServiceRequest): number => {
    if (field === "priority")
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];

    if (field === "updatedAt") return a.updatedAt.localeCompare(b.updatedAt);
    return a.createdAt.localeCompare(b.createdAt);
  };

  return [...items].sort((a, b) =>
    descending ? compare(b, a) : compare(a, b),
  );
}

const CREATE_FIELDS = [
  "title",
  "description",
  "category",
  "priority",
  "requesterName",
  "requesterEmail",
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCreate(
  body: Record<string, unknown>,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  const add = (field: string, message: string) => {
    errors[field] = [...(errors[field] ?? []), message];
  };

  checkText(body.title, "Title", 3, 120, (message) => add("title", message));
  checkText(body.description, "Description", 10, 2000, (message) =>
    add("description", message),
  );
  checkText(body.category, "Category", 2, 50, (message) =>
    add("category", message),
  );
  checkText(body.requesterName, "Requester name", 2, 100, (message) =>
    add("requesterName", message),
  );

  if (!isOneOf(body.priority, SERVICE_REQUEST_PRIORITIES)) {
    add("priority", "Choose a priority.");
  }

  const email = body.requesterEmail;
  if (typeof email !== "string" || email.trim() === "") {
    add("requesterEmail", "Requester email is required.");
  } else if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    add("requesterEmail", "Enter a valid email address.");
  }

  return errors;
}

function checkText(
  value: unknown,
  label: string,
  min: number,
  max: number,
  report: (message: string) => void,
) {
  if (typeof value !== "string" || value.trim() === "") {
    report(`${label} is required.`);
  } else if (value.trim().length < min) {
    report(`${label} must be at least ${min} characters long.`);
  } else if (value.length > max) {
    report(`${label} must be ${max} characters or fewer.`);
  }
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
): value is T {
  return (
    typeof value === "string" && (allowed as readonly string[]).includes(value)
  );
}

function toInteger(value: string): number | null {
  return /^\d+$/.test(value) ? Number(value) : null;
}
