import { useQuery } from "@tanstack/react-query";
import {
  taskService,
  type TaskFilters,
  type TaskResponse,
} from "@/services/task";

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => taskService.getTasks(filters),
    staleTime: 1000 * 30,
  });
}

export function useTask(
  taskId: string | undefined,
  options?: { initialData?: TaskResponse | null }
) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => (taskId ? taskService.getTaskById(taskId) : undefined),
    enabled: Boolean(taskId),
    staleTime: 1000 * 60,
    ...(options?.initialData !== undefined
      ? { initialData: options.initialData }
      : {}),
  });
}
