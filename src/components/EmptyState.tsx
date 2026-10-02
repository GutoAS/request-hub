import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";
import type { IconType } from "react-icons";
import { FaSearch } from "react-icons/fa";

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: IconType;
  action?: ReactNode;
}

export function EmptyState({
  title,
  message,
  icon: Icon = FaSearch,
  action,
}: EmptyStateProps) {
  return (
    <div className={styles.state}>
      <div className={styles.icon} aria-hidden="true">
        <Icon />
      </div>
      <h2 className={styles.title}>{title}</h2>
      {message && <p className={styles.message}>{message}</p>}
      {action}
    </div>
  );
}
