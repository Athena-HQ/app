import type { TaskFilters } from "@/services/task";

export const queryKeys = {
  tasks: {
    all: ["tasks"] as const,
    list: (filters: TaskFilters) => ["tasks", filters] as const,
    detail: (taskId: string) => ["task", taskId] as const,
  },
  dashboard: {
    stats: ["dashboard", "stats", "personal"] as const,
    performance: ["dashboard", "performance", "personal"] as const,
    performanceByMonths: (months: 3 | 6 | 12) =>
      ["dashboard", "performance", "personal", months] as const,
  },
  gamification: {
    myXp: ["gamification", "my_xp"] as const,
    myBadges: ["gamification", "my_badges"] as const,
  },
};
