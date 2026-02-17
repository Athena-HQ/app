import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export function useTaskRelatedInvalidation() {
  const queryClient = useQueryClient();

  const cancelTaskRelatedQueries = async (taskId?: string): Promise<void> => {
    await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });
    if (taskId) {
      await queryClient.cancelQueries({
        queryKey: queryKeys.tasks.detail(taskId),
      });
    }
    await queryClient.cancelQueries({ queryKey: queryKeys.dashboard.stats });
    await queryClient.cancelQueries({
      queryKey: queryKeys.dashboard.performance,
    });
  };

  const invalidateAfterTaskMutation = async (taskId?: string): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    if (taskId) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(taskId),
      });
    }
    await queryClient.invalidateQueries({
      queryKey: queryKeys.dashboard.stats,
      refetchType: "active",
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.dashboard.performance,
      refetchType: "active",
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.gamification.myXp,
      refetchType: "active",
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.gamification.myBadges,
      refetchType: "active",
    });
  };

  return {
    cancelTaskRelatedQueries,
    invalidateAfterTaskMutation,
  };
}
