import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService, type TaskListResponse, type TaskResponse, type TaskStatus } from "@/services/task";
import { toast } from "sonner";

export function useTaskStatusUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      taskService.updateTaskStatus(taskId, status),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      await queryClient.cancelQueries({ queryKey: ["task", taskId] });

      const previousTasks = queryClient.getQueryData<TaskListResponse[]>(["tasks"]);
      const previousTask = queryClient.getQueryData<TaskResponse>(["task", taskId]);

      if (previousTasks) {
        queryClient.setQueryData<TaskListResponse[]>(
          ["tasks"],
          previousTasks.map((task) =>
            String(task.id) === taskId ? { ...task, status } : task
          )
        );
      }

      if (previousTask) {
        queryClient.setQueryData<TaskResponse>(["task", taskId], {
          ...previousTask,
          status,
        });
      }

      return { previousTasks, previousTask };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
      if (context?.previousTask) {
        queryClient.setQueryData(["task", variables.taskId], context.previousTask);
      }
      toast.error("Failed to update task status");
    },
    onSuccess: () => {
      toast.success("Task status updated");
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
    },
  });
}

