import type { components, operations } from "./schema";

type Schemas = components["schemas"];

export type ServiceRequest = Schemas["ServiceRequest"];
export type ServiceRequestStatus = Schemas["ServiceRequestStatus"];
export type ServiceRequestPriority = Schemas["ServiceRequestPriority"];
export type ServiceRequestPage = Schemas["ServiceRequestPage"];
export type CreateServiceRequest = Schemas["CreateServiceRequest"];
export type UpdateServiceRequestStatus = Schemas["UpdateServiceRequestStatus"];
export type ProblemDetails = Schemas["ProblemDetails"];
export type ValidationProblemDetails = Schemas["ValidationProblemDetails"];

export type ListServiceRequestsParams = NonNullable<
  operations["listServiceRequests"]["parameters"]["query"]
>;

export type ServiceRequestSort = NonNullable<ListServiceRequestsParams["sort"]>;

export const SERVICE_REQUEST_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const satisfies readonly ServiceRequestStatus[];
export const SERVICE_REQUEST_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const satisfies readonly ServiceRequestPriority[];
export const SERVICE_REQUEST_SORTS = [
  "createdAt",
  "-createdAt",
  "updatedAt",
  "-updatedAt",
  "priority",
  "-priority",
] as const satisfies readonly ServiceRequestSort[];
