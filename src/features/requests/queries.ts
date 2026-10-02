import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createRequest,
  getRequest,
  listRequests,
  updateRequestStatus,
} from "../../api/requests";
import type {
  CreateServiceRequest,
  ListServiceRequestsParams,
  ServiceRequestPage,
  UpdateServiceRequestStatus,
} from "../../api/types";

export const requestKeys = {
  all: ["requests"] as const,
  lists: () => [...requestKeys.all, "list"] as const,
  list: (params: ListServiceRequestsParams) =>
    [...requestKeys.lists(), params] as const,
  details: () => [...requestKeys.all, "detail"] as const,
  detail: (id: string) => [...requestKeys.details(), id] as const,
};

export function useRequests(params: ListServiceRequestsParams) {
  return useQuery({
    queryKey: requestKeys.list(params),
    queryFn: ({ signal }) => listRequests(params, signal),
    placeholderData: keepPreviousData,
  });
}

export function useRequest(requestId: string) {
  return useQuery({
    queryKey: requestKeys.detail(requestId),
    queryFn: ({ signal }) => getRequest(requestId, signal),
    enabled: requestId !== "",
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServiceRequest) => createRequest(input),
    onSuccess: (created) => {
      queryClient.setQueryData(requestKeys.detail(created.id), created);
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    },
  });
}

export function useUpdateRequestStatus(requestId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateServiceRequestStatus) =>
      updateRequestStatus(requestId, input),
    onSuccess: (updated) => {
      queryClient.setQueryData(requestKeys.detail(requestId), updated);

      queryClient.setQueriesData<ServiceRequestPage>(
        { queryKey: requestKeys.lists() },
        (page) =>
          page && {
            ...page,
            items: page.items.map((item) =>
              item.id === updated.id ? updated : item,
            ),
          },
      );

      queryClient.invalidateQueries({ queryKey: requestKeys.lists() });
    },
    onError: (error) => {
      if (error.isConflict) {
        queryClient.invalidateQueries({
          queryKey: requestKeys.detail(requestId),
        });
      }
    },
  });
}
