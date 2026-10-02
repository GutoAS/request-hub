import type { ReactNode } from "react";
import styles from "./ErrorMessage.module.css";

interface ErrorMessageProps {
  title: string;
  detail?: string;
  traceId?: string;

  variant?: "error" | "warning" | "success";
  action?: ReactNode;
}

export function ErrorMessage({
  title,
  detail,
  traceId,
  variant = "error",
  action,
}: ErrorMessageProps) {
  return (
    <div
      className={`${styles.box} ${styles[variant]}`}
      role={variant === "success" ? "status" : "alert"}
    >
      <span className={styles.icon} aria-hidden="true">
        {variant === "success" ? "✓" : "!"}
      </span>
      <div className={styles.body}>
        <strong>{title}</strong>
        {detail && <p className={styles.detail}>{detail}</p>}
        {traceId && <p className={styles.trace}>Reference: {traceId}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
