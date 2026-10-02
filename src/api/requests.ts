import { apiFetch } from "./client";
import type {
  CreateServiceRequest,
  ListServiceRequestsParams,
  ServiceRequest,
  ServiceRequestPage,
  UpdateServiceRequestStatus,
} from "./types";

export function listRequests(
  params: ListServiceRequestsParams = {},
  signal?: AbortSignal,
) {
  return apiFetch<ServiceRequestPage>("/requests", {
    query: { ...params },
    signal,
  });
}

export function getRequest(requestId: string, signal?: AbortSignal) {
  return apiFetch<ServiceRequest>(
    `/requests/${encodeURIComponent(requestId)}`,
    { signal },
  );
}

export function createRequest(input: CreateServiceRequest) {
  return apiFetch<ServiceRequest>("/requests", { method: "POST", body: input });
}

export function updateRequestStatus(
  requestId: string,
  input: UpdateServiceRequestStatus,
) {
  return apiFetch<ServiceRequest>(
    `/requests/${encodeURIComponent(requestId)}/status`,
    {
      method: "PATCH",
      body: input,
    },
  );
}
