import type { ServiceRequestStatus } from "../../api/types";

export const ALLOWED_TRANSITIONS: Record<
  ServiceRequestStatus,
  readonly ServiceRequestStatus[]
> = {
  OPEN: ["IN_PROGRESS", "CLOSED"],
  IN_PROGRESS: ["RESOLVED", "OPEN"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: [],
};

export function nextStatuses(
  from: ServiceRequestStatus,
): readonly ServiceRequestStatus[] {
  return ALLOWED_TRANSITIONS[from];
}

export function canTransition(
  from: ServiceRequestStatus,
  to: ServiceRequestStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function isFinalStatus(status: ServiceRequestStatus): boolean {
  return ALLOWED_TRANSITIONS[status].length === 0;
}
