export interface DashboardStats {
  employees: number;
  taskVelocity: number;
  onboarding: number;
  totalXP: number;
}

export interface CompanyStockData {
  month: string;
  value: number;
}

export interface SquadDistribution {
  name: string;
  value: number;
  color: string;
}

export interface Activity {
  id: string;
  type: "user_added" | "project_completed" | "task_assigned";
  message: string;
  time: string;
  avatar?: string;
}

export interface TopPerformer {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  tasks: number;
  rank: number;
}

const mockStats: DashboardStats = {
  employees: 124,
  taskVelocity: 1.2,
  onboarding: 3,
  totalXP: 45000,
};

const mockCompanyStock: CompanyStockData[] = [
  { month: "Jan", value: 4000 },
  { month: "Feb", value: 3000 },
  { month: "Mar", value: 5000 },
  { month: "Apr", value: 4500 },
  { month: "May", value: 6000 },
  { month: "Jun", value: 5500 },
  { month: "Jul", value: 7000 },
  { month: "Aug", value: 6500 },
  { month: "Sep", value: 8000 },
  { month: "Oct", value: 7500 },
  { month: "Nov", value: 6800 },
  { month: "Dec", value: 7200 },
];

const mockSquadDistribution: SquadDistribution[] = [
  { name: "Engineering", value: 45, color: "#3b82f6" },
  { name: "Design", value: 25, color: "#eab308" },
  { name: "Marketing", value: 15, color: "#10b981" },
  { name: "Sales", value: 15, color: "#f59e0b" },
];

let mockActivities: Activity[] = [
  {
    id: "1",
    type: "user_added",
    message: "Lana Steiner was added to the Engineering squad.",
    time: "2m ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lana",
  },
  {
    id: "2",
    type: "project_completed",
    message: "Project 'Phoenix' was completed by the Design team.",
    time: "1h ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Team",
  },
  {
    id: "3",
    type: "task_assigned",
    message: "New task assigned to Marketing squad.",
    time: "3h ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Task",
  },
];

const mockTopPerformers: TopPerformer[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    xp: 12500,
    tasks: 45,
    rank: 1,
  },
  {
    id: "2",
    name: "Alex Morgan",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    xp: 11200,
    tasks: 42,
    rank: 2,
  },
  {
    id: "3",
    name: "Jamie Park",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie",
    xp: 10800,
    tasks: 38,
    rank: 3,
  },
];

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      ...mockStats,
      onboarding: mockStats.onboarding + Math.floor(Math.random() * 2),
    };
  },

  async getCompanyStock(): Promise<CompanyStockData[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockCompanyStock;
  },

  async getSquadDistribution(): Promise<SquadDistribution[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockSquadDistribution;
  },

  async getActivities(): Promise<Activity[]> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return mockActivities;
  },

  async getTopPerformers(): Promise<TopPerformer[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockTopPerformers;
  },

  addActivity(activity: Activity) {
    mockActivities = [activity, ...mockActivities].slice(0, 10);
  },
};

const activityMessages = [
  "was promoted to senior level.",
  "completed a critical milestone.",
  "joined the development squad.",
  "received an achievement badge.",
  "started a new project initiative.",
];

const names = ["Jordan Smith", "Taylor Lee", "Morgan Davis", "Casey Wong", "Riley Johnson"];

export const simulateActivityUpdates = (callback: (activity: Activity) => void) => {
  const interval = setInterval(() => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      type: ["user_added", "project_completed", "task_assigned"][Math.floor(Math.random() * 3)] as Activity["type"],
      message: `${names[Math.floor(Math.random() * names.length)]} ${activityMessages[Math.floor(Math.random() * activityMessages.length)]}`,
      time: "Just now",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
    };
    
    dashboardService.addActivity(newActivity);
    callback(newActivity);
  }, 10000);

  return () => clearInterval(interval);
};
