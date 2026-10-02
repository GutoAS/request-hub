import type {
  CreateServiceRequest,
  ServiceRequest,
  ServiceRequestStatus,
} from "../api/types";
import { createSeedRequests, toIso } from "./data";

let requests: ServiceRequest[] = createSeedRequests();

export const db = {
  all(): ServiceRequest[] {
    return requests;
  },

  find(id: string): ServiceRequest | undefined {
    return requests.find((request) => request.id === id);
  },

  create(input: CreateServiceRequest): ServiceRequest {
    const now = toIso(Date.now());
    const created: ServiceRequest = {
      ...input,
      id: nextId(),
      status: "OPEN",
      createdAt: now,
      updatedAt: now,
      version: 1,
    };
    requests = [created, ...requests];
    return created;
  },

  updateStatus(id: string, status: ServiceRequestStatus): ServiceRequest {
    const current = this.find(id);
    if (!current) {
      throw new Error(`Unknown request ${id}`);
    }
    const updated: ServiceRequest = {
      ...current,
      status,
      updatedAt: toIso(Date.now()),
      version: current.version + 1,
    };
    requests = requests.map((request) =>
      request.id === id ? updated : request,
    );
    return updated;
  },

  reset(): void {
    requests = createSeedRequests();
  },
};

function nextId(): string {
  const highest = Math.max(
    ...requests.map((request) => Number(request.id.replace("REQ-", ""))),
  );
  return `REQ-${highest + 1}`;
}
