import type { TaskFilters } from "@/services/task";

export const queryKeys = {
  tasks: {
    all: ["tasks"] as const,
    list: (filters: TaskFilters) => ["tasks", filters] as const,
    detail: (taskId: string) => ["task", taskId] as const,
    subtasks: (taskId: string) => ["task", taskId, "subtasks"] as const,
    mySquadTasks: ["tasks", "my-squad-tasks"] as const,
  },
  squads: {
    all: ["squads"] as const,
    detail: (squadId: string) => ["squad", squadId] as const,
    tasks: (squadId: string) => ["squad", squadId, "tasks"] as const,
    members: (squadId: string) => ["squad", squadId, "members"] as const,
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
  reports: {
    all: ["reports"] as const,
    list: (filters: object) => ["reports", filters] as const,
    detail: (id: number) => ["report", id] as const,
  },
};
