import { useId, useState, type FormEvent } from "react";
import { errorMessageProps } from "../../api/errorMessage";
import type { ServiceRequest, ServiceRequestStatus } from "../../api/types";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { ErrorMessage } from "../../components/ErrorMessage";
import form from "../../components/form.module.css";
import { STATUS_LABELS } from "./labels";
import { useUpdateRequestStatus } from "./queries";
import { isFinalStatus, nextStatuses } from "./transitions";
import styles from "./StatusChanger.module.css";

const NOTE_MAX_LENGTH = 500;

interface StatusChangerProps {
  request: ServiceRequest;
  onUpdated: (updated: ServiceRequest) => void;
  onConflict: () => void;
}

export function StatusChanger({
  request,
  onUpdated,
  onConflict,
}: StatusChangerProps) {
  const id = useId();
  const [newStatus, setNewStatus] = useState<ServiceRequestStatus | "">("");
  const [note, setNote] = useState("");
  const mutation = useUpdateRequestStatus(request.id);

  const options = nextStatuses(request.status);

  if (isFinalStatus(request.status)) {
    return (
      <Card className={styles.panel}>
        <h2 className={styles.heading}>Change status</h2>
        <p className={form.help}>
          This request is {STATUS_LABELS[request.status]}. Closed requests are
          final and can't be changed.
        </p>
      </Card>
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!newStatus) return;
    mutation.mutate(
      {
        status: newStatus,
        version: request.version,
        note: note.trim() || undefined,
      },
      {
        onSuccess: onUpdated,
        onError: (error) => {
          if (error.isConflict) onConflict();
        },
      },
    );
  }

  const error = mutation.error;

  return (
    <Card className={styles.panel}>
      <h2 className={styles.heading} id={`${id}-heading`}>
        Change status
      </h2>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
        aria-labelledby={`${id}-heading`}
      >
        <div className={form.field}>
          <label htmlFor={`${id}-status`} className={form.label}>
            New status
          </label>
          <select
            id={`${id}-status`}
            className={form.select}
            value={newStatus}
            onChange={(event) =>
              setNewStatus(event.target.value as ServiceRequestStatus | "")
            }
            aria-describedby={`${id}-status-help`}
            required
          >
            <option value="">Choose…</option>
            {options.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <p id={`${id}-status-help`} className={form.help}>
            Allowed from {STATUS_LABELS[request.status]}:{" "}
            {options.map((status) => STATUS_LABELS[status]).join(", ")}
          </p>
        </div>

        <div className={form.field}>
          <label htmlFor={`${id}-note`} className={form.label}>
            Note (optional)
          </label>
          <textarea
            id={`${id}-note`}
            className={form.textarea}
            value={note}
            maxLength={NOTE_MAX_LENGTH}
            onChange={(event) => setNote(event.target.value)}
            aria-describedby={`${id}-note-count`}
            placeholder="What was done, for the record"
          />
          <p id={`${id}-note-count`} className={form.counter}>
            {note.length} / {NOTE_MAX_LENGTH}
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={!newStatus || mutation.isPending}
        >
          {mutation.isPending ? "Updating…" : "Update status"}
        </Button>

        {error && !error.isConflict && (
          <ErrorMessage
            {...(error.isValidationError
              ? {
                  title: "Status not changed",
                  detail:
                    error.fieldErrors.status?.[0] ??
                    error.fieldErrors.note?.[0] ??
                    error.detail,
                  traceId: error.traceId,
                }
              : errorMessageProps(error))}
          />
        )}
      </form>
    </Card>
  );
}
