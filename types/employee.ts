export interface EmployeeProfile {
  id: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  department: string;
  joinDate: string;
  status: string;
  email?: string;
  bio?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    portfolio?: string;
    extra?: { platform: string; url: string }[];
  };
  gamification: {
    levelNumber: number;
    currentXp: number;
    xpToNextLevel: number;
    badges: Array<{
      id: string;
      name: string;
      description: string;
      unlockedAt: string;
      earnedDate?: string;
    }>;
  };
  taskAnalytics: {
    totalTasksCompleted: number;
    tasksInProgress: number;
    tasksToDo: number;
    tasksOnHold: number;
    completionRate: number;
    averageCompletionTimeDays?: number;
  };
  performance: {
    overallRating: number;
    totalFeedbackCount: number;
    fiveStarFeedbackCount: number;
    feedbackDistribution: Record<string, number>;
    trend?: string;
  };
  team: {
    squad?: {
      id: string;
      name: string;
      role: string;
    };
    contact?: {
      reportsTo?: {
        id: string;
        name: string;
        role: string;
        avatarUrl?: string;
      };
      directReports?: Array<{
        id: string;
        name: string;
        role: string;
        avatarUrl?: string;
      }>;
    };
  };
}
