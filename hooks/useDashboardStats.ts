import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTasks } from "./useTasks";
import { useCurrentAppUser } from "./useCurrentAppUser";
import {
  dashboardService,
  getDashboardStats,
  getDashboardPerformance,
  performanceToCompletionData,
} from "@/services/dashboard";
import type { TaskListResponse } from "@/services/task";
import { taskListResponseToTask } from "@/services/task";
import { getMyXp, getMyBadges } from "@/services/gamification";
import { queryKeys } from "@/lib/query-keys";

export interface DashboardStats {
  assignedTasks: TaskListResponse[];
  inProgressTasks: TaskListResponse[];
  todoTasks: TaskListResponse[];
  doneTasks: TaskListResponse[];
  onHoldTasks: TaskListResponse[];
  needsReviewTasks: TaskListResponse[];
  completionRate: number;
  averageCompletionTime: number;
  currentStreak: number;
  gamification: ReturnType<typeof dashboardService.getGamificationData>;
  taskCompletionData: {
    threeMonths: { date: string; count: number }[];
    sixMonths: { date: string; count: number }[];
    twelveMonths: { date: string; count: number }[];
  };
  widgetCounts: {
    todo: number;
    inProgress: number;
    done: number;
    onHold: number;
  };
}

export function useDashboardStats() {
  const { appUser } = useCurrentAppUser();
  const currentUserId = appUser?.id;

  const { data: apiStats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => getDashboardStats("personal"),
    staleTime: 1000 * 60,
  });

  const [perf3, perf6, perf12] = useQueries({
    queries: [3, 6, 12].map((months) => ({
      queryKey: queryKeys.dashboard.performanceByMonths(months as 3 | 6 | 12),
      queryFn: () =>
        getDashboardPerformance("personal", undefined, months as 3 | 6 | 12),
      staleTime: 1000 * 60,
    })),
  });

  const { data: myXp } = useQuery({
    queryKey: queryKeys.gamification.myXp,
    queryFn: getMyXp,
    staleTime: 1000 * 60,
  });

  const { data: myBadges = [] } = useQuery({
    queryKey: queryKeys.gamification.myBadges,
    queryFn: getMyBadges,
    staleTime: 1000 * 60,
  });

  const { data: assignedTasksRaw = [], isLoading: tasksLoading } = useTasks(
    currentUserId ? { assigned_to: currentUserId } : {}
  );
  const { data: needsReviewRaw = [] } = useTasks(
    currentUserId ? { status: "completed", assigned_by: currentUserId } : {}
  );

  const stats = useMemo((): DashboardStats => {
    const assignedTasks = assignedTasksRaw;
    const inProgressTasks = assignedTasks.filter(
      (t) => t.status === "in_progress"
    );
    const todoTasks = assignedTasks.filter((t) => t.status === "assigned");
    const doneTasks = assignedTasks.filter(
      (t) => t.status === "completed" || t.status === "under_review"
    );
    const onHoldTasks = assignedTasks.filter(
      (t) =>
        t.status === "assigned" &&
        t.due_date &&
        new Date(t.due_date) < new Date()
    );
    const needsReviewTasks = needsReviewRaw;

    const totalAssigned = apiStats?.total ?? assignedTasks.length;
    const doneCount = apiStats
      ? apiStats.done + apiStats.under_review
      : doneTasks.length;
    const completionRate =
      totalAssigned > 0 ? (doneCount / totalAssigned) * 100 : 0;

    const assignedAsTask = assignedTasks.map(taskListResponseToTask);
    const clientGamification = dashboardService.getGamificationData(assignedAsTask);
    const gamification = {
      ...clientGamification,
      xp: myXp?.total_xp ?? clientGamification.xp,
      level: myXp?.level ?? clientGamification.level,
      xpToNextLevel: myXp
        ? Math.max(0, (Math.floor(myXp.total_xp / 1000) + 1) * 1000 - myXp.total_xp)
        : clientGamification.xpToNextLevel,
      totalXpForNextLevel: myXp
        ? (Math.floor(myXp.total_xp / 1000) + 1) * 1000
        : clientGamification.totalXpForNextLevel,
      badges:
        myBadges.length > 0
          ? myBadges.map((eb) => ({
              id: String(eb.id),
              name: eb.badge.name,
              description: eb.badge.description,
              icon: eb.badge.icon || "🏅",
              earnedAt: new Date(eb.earned_at),
            }))
          : clientGamification.badges,
    };

    const threeMonths = performanceToCompletionData(perf3.data ?? []);
    const sixMonths = performanceToCompletionData(perf6.data ?? []);
    const twelveMonths = performanceToCompletionData(perf12.data ?? []);

    const todoCount = apiStats?.to_do ?? todoTasks.length;
    const inProgressCount = apiStats?.in_progress ?? inProgressTasks.length;
    const doneCountForWidget =
      apiStats != null
        ? apiStats.done + apiStats.under_review
        : doneTasks.length;
    const onHoldCount = apiStats?.on_hold ?? onHoldTasks.length;

    return {
      assignedTasks,
      inProgressTasks,
      todoTasks,
      doneTasks,
      onHoldTasks,
      needsReviewTasks,
      completionRate: Math.round(completionRate * 10) / 10,
      averageCompletionTime: 0,
      currentStreak: 0,
      gamification,
      taskCompletionData: {
        threeMonths,
        sixMonths,
        twelveMonths,
      },
      widgetCounts: {
        todo: todoCount,
        inProgress: inProgressCount,
        done: doneCountForWidget,
        onHold: onHoldCount,
      },
    };
  }, [
    assignedTasksRaw,
    needsReviewRaw,
    apiStats,
    perf3.data,
    perf6.data,
    perf12.data,
    myXp,
    myBadges,
  ]);

  const isLoading = statsLoading || tasksLoading;

  return { data: stats, isLoading };
}
