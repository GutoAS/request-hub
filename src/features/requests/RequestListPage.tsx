import { errorMessageProps } from "../../api/errorMessage";
import { Button, ButtonLink } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { ErrorMessage } from "../../components/ErrorMessage";
import { PageHeader } from "../../components/PageHeader";
import { Spinner } from "../../components/Spinner";
import { hasActiveFilters, PAGE_SIZE, toApiParams } from "./listFilters";
import { Pagination } from "./Pagination";
import { useRequests } from "./queries";
import { RequestFilters } from "./RequestFilters";
import { RequestTable } from "./RequestTable";
import styles from "./RequestPages.module.css";
import { useRequestListFilters } from "./useRequestListFilters";

export function RequestListPage() {
  const {
    filters,
    setSearch,
    setStatus,
    setPriority,
    setSort,
    setPage,
    clearFilters,
  } = useRequestListFilters();
  const { data, isPending, isError, error, refetch, isPlaceholderData } =
    useRequests(toApiParams(filters));
  const filtered = hasActiveFilters(filters);

  function changePage(page: number) {
    setPage(page);
    window.scrollTo({ top: 0 });
  }

  return (
    <>
      <PageHeader
        title="Customer service requests"
        subtitle={data ? resultSummary(data.total, filtered) : undefined}
        actions={
          <ButtonLink to="/requests/new" variant="primary">
            + New request
          </ButtonLink>
        }
      />

      <RequestFilters
        filters={filters}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onSortChange={setSort}
        onClear={clearFilters}
      />

      <p className="visually-hidden" aria-live="polite">
        {data ? resultSummary(data.total, filtered) : ""}
      </p>

      <Card>
        {isPending ? (
          <Spinner label="Loading requests…" />
        ) : isError ? (
          <div className={styles.cardPadding}>
            <ErrorMessage
              {...errorMessageProps(error)}
              action={<Button onClick={() => refetch()}>Try again</Button>}
            />
          </div>
        ) : data.total === 0 && filtered ? (
          <EmptyState
            title="No requests match your filters"
            message="Try a different search, or clear the filters to see every request."
            action={<Button onClick={clearFilters}>Clear filters</Button>}
          />
        ) : data.total === 0 ? (
          <EmptyState
            title="No requests yet"
            message="New service requests will appear here."
            action={
              <ButtonLink to="/requests/new" variant="primary">
                Create the first request
              </ButtonLink>
            }
          />
        ) : data.items.length === 0 ? (
          <EmptyState
            title={`Page ${filters.page} doesn't exist`}
            message={`There are only ${data.totalPages} pages of results.`}
            action={
              <Button onClick={() => changePage(1)}>
                Go to the first page
              </Button>
            }
          />
        ) : (
          <>
            <RequestTable
              requests={data.items}
              isUpdating={isPlaceholderData}
            />
            {data.totalPages > 1 && (
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                total={data.total}
                pageSize={PAGE_SIZE}
                onPageChange={changePage}
              />
            )}
          </>
        )}
      </Card>
    </>
  );
}

function resultSummary(total: number, filtered: boolean): string {
  const noun = total === 1 ? "request" : "requests";
  return filtered ? `${total} matching ${noun}` : `${total} ${noun}`;
}
