import type { ServiceRequestStatus } from "../api/types";
import { STATUS_LABELS } from "../features/requests/labels";
import styles from "./StatusBadge.module.css";

export function StatusBadge({ status }: { status: ServiceRequestStatus }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
