import {
  SERVICE_REQUEST_PRIORITIES,
  SERVICE_REQUEST_STATUSES,
  type ListServiceRequestsParams,
  type ServiceRequestPriority,
  type ServiceRequestStatus,
} from "../../api/types";

export const PAGE_SIZE = 10;

export const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest first" },
  { value: "createdAt", label: "Oldest first" },
] as const;

export type ListSort = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: ListSort = "-createdAt";

export interface RequestListFilters {
  search: string;
  status?: ServiceRequestStatus;
  priority?: ServiceRequestPriority;
  sort: ListSort;
  page: number;
}

export function parseListFilters(params: URLSearchParams): RequestListFilters {
  const status = params.get("status");
  const priority = params.get("priority");
  const sort = params.get("sort");
  const page = Number(params.get("page"));

  return {
    search: (params.get("search") ?? "").slice(0, 100), // the API allows 100 characters
    status: isOneOf(status, SERVICE_REQUEST_STATUSES) ? status : undefined,
    priority: isOneOf(priority, SERVICE_REQUEST_PRIORITIES)
      ? priority
      : undefined,
    sort: isOneOf(
      sort,
      SORT_OPTIONS.map((option) => option.value),
    )
      ? sort
      : DEFAULT_SORT,
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

export function toSearchParams(filters: RequestListFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

export function toApiParams(
  filters: RequestListFilters,
): ListServiceRequestsParams {
  return {
    search: filters.search.trim() || undefined,
    status: filters.status,
    priority: filters.priority,
    sort: filters.sort,
    page: filters.page,
    pageSize: PAGE_SIZE,
  };
}

export function hasActiveFilters(filters: RequestListFilters): boolean {
  return Boolean(filters.search || filters.status || filters.priority);
}

function isOneOf<T extends string>(
  value: string | null,
  allowed: readonly T[],
): value is T {
  return value !== null && (allowed as readonly string[]).includes(value);
}
