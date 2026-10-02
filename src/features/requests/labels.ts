import type {
  ServiceRequestPriority,
  ServiceRequestStatus,
} from "../../api/types";

export const STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const PRIORITY_LABELS: Record<ServiceRequestPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};
