import { api, ApiError } from "@/lib/api/api-util";
import type { AppUserResponse } from "./company";

export type TaskStatus =
  | "assigned"
  | "in_progress"
  | "completed"
  | "under_review"
  | "on_hold";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskCategory =
  | "feature"
  | "bug"
  | "improvement"
  | "documentation"
  | "research"
  | "testing"
  | "other";

export interface TaskListResponse {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  due_date: string | null;
  assigned_to_name: string | null;
  assigned_by_name: string | null;
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string;
  company: number;
  squad: number | null;
  squad_name: string | null;
  assigned_by: AppUserResponse;
  assigned_to: AppUserResponse;
  assigned_to_id?: number;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  assigned_to_id: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  due_date?: string | null;
  squad?: number | null;
}

export interface UpdateTaskRequest {
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  assigned_to_id?: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: number;
  squad?: number;
  assigned_by?: number;
}

export interface DashboardStatsResponse {
  to_do: number;
  in_progress: number;
  completed: number;
  on_hold: number;
  reviewed?: number;
  total: number;
}

function buildQueryString(filters: TaskFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.assigned_to != null) params.set("assigned_to", String(filters.assigned_to));
  if (filters.squad != null) params.set("squad", String(filters.squad));
  if (filters.assigned_by != null) params.set("assigned_by", String(filters.assigned_by));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const listTasks = async (
  filters: TaskFilters = {}
): Promise<TaskListResponse[]> => {
  const qs = buildQueryString(filters);
  const path = qs ? `/tasks/${qs}` : "/tasks/";
  const response = await api.get<TaskListResponse[]>(path);
  return Array.isArray(response) ? response : [];
};

export const getTask = async (id: number): Promise<TaskResponse> => {
  const response = await api.get<TaskResponse>(`/tasks/${id}/`);
  return response;
};

export const createTask = async (
  data: CreateTaskRequest
): Promise<TaskResponse> => {
  const response = await api.post<TaskResponse>("/tasks/", {
    ...data,
    status: data.status ?? "assigned",
    priority: data.priority ?? "medium",
    category: data.category ?? "feature",
  });
  return response;
};

export const updateTask = async (
  id: number,
  data: UpdateTaskRequest
): Promise<TaskResponse> => {
  const response = await api.patch<TaskResponse>(`/tasks/${id}/`, data);
  return response;
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}/`);
};

export const getMyTasks = async (
  status?: TaskStatus
): Promise<TaskListResponse[]> => {
  const qs = status ? `?status=${status}` : "";
  const response = await api.get<TaskListResponse[]>(`/tasks/my_tasks/${qs}`);
  return Array.isArray(response) ? response : [];
};

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  const response = await api.get<DashboardStatsResponse>(
    "/tasks/dashboard_stats/"
  );
  return response;
};

export const TASK_PRIORITIES: TaskPriority[] = [
  "low",
  "medium",
  "high",
  "critical",
];
export const TASK_CATEGORIES: TaskCategory[] = [
  "feature",
  "bug",
  "improvement",
  "documentation",
  "research",
  "testing",
  "other",
];
export const TASK_STATUSES: TaskStatus[] = [
  "assigned",
  "in_progress",
  "completed",
  "under_review",
  "on_hold",
];

export interface Task {
  id: string;
  title: string;
  description: string;
  assignerId: string;
  assigneeId: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function taskListResponseToTask(t: TaskListResponse): Task {
  return {
    id: String(t.id),
    title: t.title,
    description: "",
    assignerId: "",
    assigneeId: "",
    status: t.status,
    priority: t.priority,
    category: t.category,
    dueDate: t.due_date ?? undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function taskResponseToTask(t: TaskResponse): Task {
  return {
    id: String(t.id),
    title: t.title,
    description: t.description,
    assignerId: String(t.assigned_by?.id ?? ""),
    assigneeId: String(t.assigned_to?.id ?? ""),
    status: t.status,
    priority: t.priority,
    category: t.category,
    dueDate: t.due_date ?? undefined,
    createdAt: new Date(t.created_at),
    updatedAt: new Date(t.updated_at),
  };
}

export const taskService = {
  async createTask(data: CreateTaskRequest): Promise<TaskResponse> {
    return createTask(data);
  },
  async getTasks(filters: TaskFilters = {}): Promise<TaskListResponse[]> {
    return listTasks(filters);
  },
  async getTaskById(id: string): Promise<TaskResponse | null> {
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) return null;
    try {
      return await getTask(numId);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },
  async updateTaskStatus(
    id: string,
    status: TaskStatus
  ): Promise<TaskResponse> {
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) throw new Error("Invalid task id");
    return updateTask(numId, { status });
  },
  async updateTask(
    id: string,
    data: UpdateTaskRequest & { title?: string; description?: string }
  ): Promise<TaskResponse> {
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) throw new Error("Invalid task id");
    return updateTask(numId, data);
  },
  async deleteTask(id: string): Promise<void> {
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) throw new Error("Invalid task id");
    return deleteTask(numId);
  },
};
