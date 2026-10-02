import { useState, useEffect } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { MdErrorOutline } from "react-icons/md";
import { errorMessageProps } from "../../api/errorMessage";
import type { ServiceRequest } from "../../api/types";
import { Button, ButtonLink } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { ErrorMessage } from "../../components/ErrorMessage";
import { PriorityTag } from "../../components/PriorityTag";
import { Spinner } from "../../components/Spinner";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../utils/formatDate";
import { STATUS_LABELS } from "./labels";
import { useRequest } from "./queries";
import styles from "./RequestDetailPage.module.css";
import { StatusChanger } from "./StatusChanger";

type Notice =
  | { kind: "created" }
  | { kind: "updated"; status: ServiceRequest["status"] }
  | { kind: "conflict" };

export function RequestDetailPage() {
  const { requestId = "" } = useParams();
  const {
    data: request,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useRequest(requestId);

  const location = useLocation();
  const navigate = useNavigate();

  const [notice, setNotice] = useState<Notice | null>(() =>
    (location.state as { created?: boolean } | null)?.created
      ? { kind: "created" }
      : null,
  );

  useEffect(() => {
    if (location.state)
      navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  return (
    <>
      <Link to="/requests" className={styles.backLink}>
        ← Back to requests
      </Link>

      {isPending ? (
        <Card>
          <Spinner label="Loading request…" />
        </Card>
      ) : isError && error.isNotFound ? (
        <Card>
          <EmptyState
            icon={MdErrorOutline}
            title="Request not found"
            message={
              error.detail ?? `No service request exists with id ${requestId}.`
            }
            action={<ButtonLink to="/requests">Back to requests</ButtonLink>}
          />
        </Card>
      ) : isError ? (
        <ErrorMessage
          {...errorMessageProps(error)}
          action={<Button onClick={() => refetch()}>Try again</Button>}
        />
      ) : (
        <>
          <header className={styles.header}>
            <p className={styles.id}>{request.id}</p>
            <h1>{request.title}</h1>
            <div className={styles.tags}>
              <StatusBadge status={request.status} />
              <PriorityTag priority={request.priority} withSuffix />
            </div>
          </header>

          {notice?.kind === "conflict" && (
            <div className={styles.notice}>
              <ErrorMessage
                variant="warning"
                title="This request was changed by someone else."
                detail={
                  isFetching
                    ? "Loading the latest version…"
                    : `We loaded the latest version (now ${STATUS_LABELS[request.status]}, version ${request.version}). Your change was not saved. Check the new status and try again if needed.`
                }
                action={
                  <Button onClick={() => setNotice(null)}>Dismiss</Button>
                }
              />
            </div>
          )}
          {notice?.kind === "created" && (
            <div className={styles.notice}>
              <ErrorMessage
                variant="success"
                title={`Request ${request.id} created.`}
                action={
                  <Button onClick={() => setNotice(null)}>Dismiss</Button>
                }
              />
            </div>
          )}
          {notice?.kind === "updated" && (
            <div className={styles.notice}>
              <ErrorMessage
                variant="success"
                title={`Status changed to ${STATUS_LABELS[notice.status]}.`}
                action={
                  <Button onClick={() => setNotice(null)}>Dismiss</Button>
                }
              />
            </div>
          )}

          <div className={styles.layout}>
            <Card className={styles.details}>
              <h2 className={styles.sectionTitle}>Description</h2>

              <p className={styles.description}>{request.description}</p>

              <dl className={styles.facts}>
                <dt>Category</dt>
                <dd>{request.category}</dd>

                <dt>Requester</dt>
                <dd>
                  {request.requesterName}
                  <br />
                  <a href={`mailto:${request.requesterEmail}`}>
                    {request.requesterEmail}
                  </a>
                </dd>

                <dt>Created</dt>
                <dd>
                  <time dateTime={request.createdAt}>
                    {formatDateTime(request.createdAt)}
                  </time>
                </dd>

                <dt>Last updated</dt>
                <dd>
                  <time dateTime={request.updatedAt}>
                    {formatDateTime(request.updatedAt)}
                  </time>
                </dd>

                <dt>Version</dt>
                <dd>{request.version}</dd>
              </dl>
            </Card>

            <StatusChanger
              key={request.version}
              request={request}
              onUpdated={(updated) =>
                setNotice({ kind: "updated", status: updated.status })
              }
              onConflict={() => setNotice({ kind: "conflict" })}
            />
          </div>
        </>
      )}
    </>
  );
}
