import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  SERVICE_REQUEST_PRIORITIES,
  SERVICE_REQUEST_STATUSES,
  type ServiceRequestPriority,
  type ServiceRequestStatus,
} from "../../api/types";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import form from "../../components/form.module.css";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { PRIORITY_LABELS, STATUS_LABELS } from "./labels";
import {
  SORT_OPTIONS,
  hasActiveFilters,
  type ListSort,
  type RequestListFilters,
} from "./listFilters";
import styles from "./RequestFilters.module.css";

interface RequestFiltersProps {
  filters: RequestListFilters;
  onSearchChange: (search: string) => void;
  onStatusChange: (status?: ServiceRequestStatus) => void;
  onPriorityChange: (priority?: ServiceRequestPriority) => void;
  onSortChange: (sort: ListSort) => void;
  onClear: () => void;
}

const SEARCH_DELAY_MS = 300;

export function RequestFilters({
  filters,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onSortChange,
  onClear,
}: RequestFiltersProps) {
  const id = useId();

  const [searchText, setSearchText] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchText, SEARCH_DELAY_MS);

  const lastSent = useRef(filters.search);

  function sendSearch(value: string) {
    const trimmed = value.trim();
    if (trimmed === filters.search) return;
    lastSent.current = trimmed;
    onSearchChange(trimmed);
  }

  const onDebouncedSearch = useEffectEvent((value: string) =>
    sendSearch(value),
  );

  useEffect(() => {
    onDebouncedSearch(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    if (filters.search !== lastSent.current) {
      lastSent.current = filters.search;
      setSearchText(filters.search);
    }
  }, [filters.search]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    sendSearch(searchText);
  }

  return (
    <Card className={styles.filters}>
      <form role="search" className={styles.search} onSubmit={handleSubmit}>
        <div className={form.field}>
          <label htmlFor={`${id}-search`} className={form.label}>
            Search
          </label>
          <input
            id={`${id}-search`}
            type="search"
            className={form.input}
            placeholder="Title or requester"
            maxLength={100}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>
      </form>

      <div className={form.field}>
        <label htmlFor={`${id}-status`} className={form.label}>
          Status
        </label>
        <select
          id={`${id}-status`}
          className={form.select}
          value={filters.status ?? ""}
          onChange={(event) =>
            onStatusChange(
              (event.target.value || undefined) as
                | ServiceRequestStatus
                | undefined,
            )
          }
        >
          <option value="">All statuses</option>
          {SERVICE_REQUEST_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div className={form.field}>
        <label htmlFor={`${id}-priority`} className={form.label}>
          Priority
        </label>
        <select
          id={`${id}-priority`}
          className={form.select}
          value={filters.priority ?? ""}
          onChange={(event) =>
            onPriorityChange(
              (event.target.value || undefined) as
                | ServiceRequestPriority
                | undefined,
            )
          }
        >
          <option value="">All priorities</option>
          {SERVICE_REQUEST_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
      </div>

      <div className={form.field}>
        <label htmlFor={`${id}-sort`} className={form.label}>
          Sort
        </label>
        <select
          id={`${id}-sort`}
          className={form.select}
          value={filters.sort}
          onChange={(event) => onSortChange(event.target.value as ListSort)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <Button
        className={styles.clear}
        onClick={onClear}
        disabled={!hasActiveFilters(filters)}
      >
        Clear
      </Button>
    </Card>
  );
}
