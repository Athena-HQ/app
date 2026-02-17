import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService, type TaskListResponse, type TaskResponse, type TaskStatus } from "@/services/task";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { useTaskRelatedInvalidation } from "./useTaskRelatedInvalidation";

export function useTaskStatusUpdate() {
  const queryClient = useQueryClient();
  const { cancelTaskRelatedQueries, invalidateAfterTaskMutation } =
    useTaskRelatedInvalidation();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      taskService.updateTaskStatus(taskId, status),
    onMutate: async ({ taskId, status }) => {
      await cancelTaskRelatedQueries(taskId);

      const previousTasks = queryClient.getQueryData<TaskListResponse[]>(
        queryKeys.tasks.all
      );
      const previousTask = queryClient.getQueryData<TaskResponse>(
        queryKeys.tasks.detail(taskId)
      );

      if (previousTasks) {
        queryClient.setQueryData<TaskListResponse[]>(
          queryKeys.tasks.all,
          previousTasks.map((task) =>
            String(task.id) === taskId ? { ...task, status } : task
          )
        );
      }

      if (previousTask) {
        queryClient.setQueryData<TaskResponse>(queryKeys.tasks.detail(taskId), {
          ...previousTask,
          status,
        });
      }

      return { previousTasks, previousTask };
    },
    onError: (_err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks.all, context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(
          queryKeys.tasks.detail(variables.taskId),
          context.previousTask
        );
      }
      toast.error("Failed to update task status");
    },
    onSuccess: () => {
      toast.success("Task status updated");
    },
    onSettled: async (data, error, variables) => {
      await invalidateAfterTaskMutation(variables.taskId);
    },
  });
}
