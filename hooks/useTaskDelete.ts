import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { taskService } from "@/services/task";
import { useTaskRelatedInvalidation } from "./useTaskRelatedInvalidation";

export function useTaskDelete() {
  const { invalidateAfterTaskMutation } = useTaskRelatedInvalidation();

  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: async (_, taskId) => {
      await invalidateAfterTaskMutation(taskId);
      toast.success("Task deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });
}
