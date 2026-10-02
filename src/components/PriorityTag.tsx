import type { ServiceRequestPriority } from "../api/types";
import { PRIORITY_LABELS } from "../features/requests/labels";
import styles from "./PriorityTag.module.css";

interface PriorityTagProps {
  priority: ServiceRequestPriority;

  withSuffix?: boolean;
}

export function PriorityTag({
  priority,
  withSuffix = false,
}: PriorityTagProps) {
  return (
    <span className={styles.tag}>
      <span
        className={`${styles.dot} ${styles[priority]}`}
        aria-hidden="true"
      />
      {PRIORITY_LABELS[priority]}
      {withSuffix && " priority"}
    </span>
  );
}
