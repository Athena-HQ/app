import { api } from "@/lib/api/api-util";
import type { Task } from "./task";

export interface DashboardStatsResponse {
  to_do: number;
  in_progress: number;
  under_review: number;
  done: number;
  on_hold: number;
  total: number;
}

export interface DashboardPerformanceItem {
  month: string;
  count: number;
}

export async function getDashboardStats(
  scope: "personal" | "company" = "personal",
  userId?: number
): Promise<DashboardStatsResponse> {
  const params = new URLSearchParams({ scope });
  if (userId != null) params.set("user_id", String(userId));
  const qs = params.toString();
  const path = qs ? `/dashboard/stats/?${qs}` : "/dashboard/stats/?scope=personal";
  const response = await api.get<DashboardStatsResponse>(path);
  return response;
}

export async function getDashboardPerformance(
  scope: "personal" | "company" = "personal",
  userId?: number,
  months: 3 | 6 | 12 = 6
): Promise<DashboardPerformanceItem[]> {
  const params = new URLSearchParams({ scope, months: String(months) });
  if (userId != null) params.set("user_id", String(userId));
  const path = `/dashboard/performance/?${params.toString()}`;
  const response = await api.get<DashboardPerformanceItem[]>(path);
  return Array.isArray(response) ? response : [];
}

export function performanceToCompletionData(
  items: DashboardPerformanceItem[]
): TaskCompletionData[] {
  return items.map((item) => ({
    date: item.month,
    count: item.count,
  }));
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
}

export interface GamificationData {
  xp: number;
  level: number;
  xpToNextLevel: number;
  totalXpForNextLevel: number;
  badges: Badge[];
  achievements: Achievement[];
}

export interface TaskCompletionData {
  date: string;
  count: number;
}

function calculateXPFromTasks(tasks: Task[]): number {
  const completedTasks = tasks.filter(
    (t) => t.status === "completed" || t.status === "under_review"
  );

  let xp = 0;
  completedTasks.forEach((task) => {
    const baseXP = 50;
    const priorityMultiplier: Record<string, number> = {
      low: 1,
      medium: 1.5,
      high: 2,
      critical: 2.5,
    };
    const categoryMultiplier: Record<string, number> = {
      feature: 1.2,
      bug: 1.1,
      improvement: 1.1,
      documentation: 1,
      research: 1,
      testing: 1,
      other: 1,
    };

    xp +=
      baseXP *
      (priorityMultiplier[task.priority] || 1) *
      (categoryMultiplier[task.category] || 1);
  });

  return Math.floor(xp);
}

function calculateLevel(xp: number): { level: number; xpToNextLevel: number; totalXpForNextLevel: number } {
  const baseXP = 1000;
  const multiplier = 1.5;
  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = baseXP;

  while (xp >= xpForNextLevel) {
    xpForCurrentLevel = xpForNextLevel;
    level++;
    xpForNextLevel = Math.floor(xpForCurrentLevel * multiplier);
  }

  const xpToNextLevel = xpForNextLevel - xp;

  return {
    level,
    xpToNextLevel: Math.max(0, xpToNextLevel),
    totalXpForNextLevel: xpForNextLevel - xpForCurrentLevel,
  };
}

function generateBadges(tasks: Task[]): Badge[] {
  const badges: Badge[] = [];
  const completedCount = tasks.filter(
    (t) => t.status === "completed" || t.status === "under_review"
  ).length;

  if (completedCount >= 10) {
    badges.push({
      id: "rookie",
      name: "Rookie",
      description: "Completed 10+ tasks",
      icon: "🌟",
      earnedAt: new Date(),
    });
  }
  if (completedCount >= 50) {
    badges.push({
      id: "dedicated",
      name: "Dedicated",
      description: "Completed 50+ tasks",
      icon: "🔥",
      earnedAt: new Date(),
    });
  }
  if (completedCount >= 100) {
    badges.push({
      id: "centurion",
      name: "Centurion",
      description: "Completed 100+ tasks",
      icon: "💯",
      earnedAt: new Date(),
    });
  }
  if (completedCount >= 200) {
    badges.push({
      id: "veteran",
      name: "Veteran",
      description: "Completed 200+ tasks",
      icon: "⭐",
      earnedAt: new Date(),
    });
  }
  if (completedCount >= 300) {
    badges.push({
      id: "legend",
      name: "Legend",
      description: "Completed 300+ tasks",
      icon: "👑",
      earnedAt: new Date(),
    });
  }

  const highPriorityTasks = tasks.filter(
    (t) =>
      (t.status === "completed" || t.status === "under_review") &&
      (t.priority === "high" || t.priority === "critical")
  ).length;
  if (highPriorityTasks >= 20) {
    badges.push({
      id: "high_priority_master",
      name: "High Priority Master",
      description: "Completed 20+ high priority tasks",
      icon: "⚡",
      earnedAt: new Date(),
    });
  }

  return badges;
}

function generateAchievements(tasks: Task[]): Achievement[] {
  const completedCount = tasks.filter(
    (t) => t.status === "completed" || t.status === "under_review"
  ).length;

  return [
    {
      id: "task_100",
      name: "100 Tasks",
      description: "Complete 100 tasks",
      progress: completedCount,
      target: 100,
      completed: completedCount >= 100,
    },
    {
      id: "task_200",
      name: "200 Tasks",
      description: "Complete 200 tasks",
      progress: completedCount,
      target: 200,
      completed: completedCount >= 200,
    },
    {
      id: "task_300",
      name: "300 Tasks",
      description: "Complete 300 tasks",
      progress: completedCount,
      target: 300,
      completed: completedCount >= 300,
    },
  ];
}

function generateTaskCompletionData(
  tasks: Task[],
  months: number
): TaskCompletionData[] {
  const completedTasks = tasks.filter(
    (t) => t.status === "completed" || t.status === "under_review"
  );

  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const dataMap = new Map<string, number>();

  completedTasks.forEach((task) => {
    const taskDate = new Date(task.updatedAt);
    if (taskDate >= startDate && taskDate <= endDate) {
      const dateKey = taskDate.toISOString().split("T")[0];
      dataMap.set(dateKey, (dataMap.get(dateKey) || 0) + 1);
    }
  });

  const result: TaskCompletionData[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split("T")[0];
    result.push({
      date: dateKey,
      count: dataMap.get(dateKey) || 0,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}

export const dashboardService = {
  getGamificationData(tasks: Task[]): GamificationData {
    const xp = calculateXPFromTasks(tasks);
    const { level, xpToNextLevel, totalXpForNextLevel } = calculateLevel(xp);
    const badges = generateBadges(tasks);
    const achievements = generateAchievements(tasks);

    return {
      xp,
      level,
      xpToNextLevel,
      totalXpForNextLevel,
      badges,
      achievements,
    };
  },

  getTaskCompletionData(tasks: Task[], months: number): TaskCompletionData[] {
    return generateTaskCompletionData(tasks, months);
  },
};

