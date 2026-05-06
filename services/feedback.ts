import { api } from "@/lib/api/api-util";

export type FeedbackAttributeValue = 1 | 2 | 3 | 4 | 5;

export interface FeedbackResponse {
  id: number;
  reviewer: number;
  reviewer_detail: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string | null;
  };
  to_app_user: number | null;
  to_app_user_detail: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string | null;
  } | null;
  to_squad: number | null;
  to_squad_detail: {
    id: number;
    name: string;
  } | null;
  task: number | null;
  task_title: string | null;
  communication: number;
  quality_of_work: number;
  timeliness: number;
  teamwork: number;
  initiative: number;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface CreateFeedbackRequest {
  to_app_user?: number | null;
  to_squad?: number | null;
  task?: number | null;
  communication: FeedbackAttributeValue;
  quality_of_work: FeedbackAttributeValue;
  timeliness: FeedbackAttributeValue;
  teamwork: FeedbackAttributeValue;
  initiative: FeedbackAttributeValue;
  comment?: string | null;
}

export const FEEDBACK_ATTRIBUTES = [
  { key: "communication" as const, label: "Communication" },
  { key: "quality_of_work" as const, label: "Quality of Work" },
  { key: "timeliness" as const, label: "Timeliness" },
  { key: "teamwork" as const, label: "Teamwork" },
  { key: "initiative" as const, label: "Initiative" },
] as const;

export async function listFeedback(toAppUserId?: number): Promise<FeedbackResponse[]> {
  const path = toAppUserId != null
    ? `/feedback/?to_app_user=${toAppUserId}`
    : "/feedback/";
  const response = await api.get<FeedbackResponse[]>(path);
  return Array.isArray(response) ? response : [];
}

export async function listFeedbackForSquad(squadId: number): Promise<FeedbackResponse[]> {
  const response = await api.get<FeedbackResponse[]>(`/feedback/?to_squad=${squadId}`);
  return Array.isArray(response) ? response : [];
}

export async function listFeedbackForTask(taskId: number): Promise<FeedbackResponse[]> {
  const response = await api.get<FeedbackResponse[]>(`/feedback/?task=${taskId}`);
  return Array.isArray(response) ? response : [];
}

export async function getFeedback(id: number): Promise<FeedbackResponse> {
  return api.get<FeedbackResponse>(`/feedback/${id}/`);
}

export async function createFeedback(data: CreateFeedbackRequest): Promise<FeedbackResponse> {
  return api.post<FeedbackResponse>("/feedback/", data);
}

export async function deleteFeedback(id: number): Promise<void> {
  await api.delete(`/feedback/${id}/`);
}

export const feedbackService = {
  listFeedback,
  listFeedbackForTask,
  listFeedbackForSquad,
  getFeedback,
  createFeedback,
  deleteFeedback,
};
