import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type {
  ServiceRequestPriority,
  ServiceRequestStatus,
} from "../../api/types";
import {
  parseListFilters,
  toSearchParams,
  type ListSort,
  type RequestListFilters,
} from "./listFilters";

export function useRequestListFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseListFilters(searchParams), [searchParams]);

  function update(
    changes: Partial<RequestListFilters>,
    { replace = false } = {},
  ) {
    const next: RequestListFilters = { ...filters, page: 1, ...changes };
    setSearchParams(toSearchParams(next), { replace });
  }

  return {
    filters,
    setSearch: (search: string) => update({ search }, { replace: true }),
    setStatus: (status?: ServiceRequestStatus) => update({ status }),
    setPriority: (priority?: ServiceRequestPriority) => update({ priority }),
    setSort: (sort: ListSort) => update({ sort }),
    setPage: (page: number) => update({ page }),
    clearFilters: () =>
      update({ search: "", status: undefined, priority: undefined }),
  };
}
