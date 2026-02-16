import { api } from "@/lib/api/api-util";

export type FeedbackAttributeValue = 0 | 0.2 | 0.4 | 0.6 | 0.8 | 1;

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
  to_app_user: number;
  to_app_user_detail: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string | null;
  };
  task: number | null;
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
  to_app_user: number;
  task?: number | null;
  communication: FeedbackAttributeValue;
  quality_of_work: FeedbackAttributeValue;
  timeliness: FeedbackAttributeValue;
  teamwork: FeedbackAttributeValue;
  initiative: FeedbackAttributeValue;
  comment?: string | null;
}

export interface UpdateFeedbackRequest {
  communication?: FeedbackAttributeValue;
  quality_of_work?: FeedbackAttributeValue;
  timeliness?: FeedbackAttributeValue;
  teamwork?: FeedbackAttributeValue;
  initiative?: FeedbackAttributeValue;
  comment?: string | null;
}

export const FEEDBACK_ATTRIBUTE_OPTIONS: { value: FeedbackAttributeValue; label: string }[] = [
  { value: 0, label: "Poor" },
  { value: 0.2, label: "Below Average" },
  { value: 0.4, label: "Average" },
  { value: 0.6, label: "Good" },
  { value: 0.8, label: "Very Good" },
  { value: 1, label: "Excellent" },
];

export async function listFeedback(toAppUserId?: number): Promise<FeedbackResponse[]> {
  const path = toAppUserId != null
    ? `/feedback/?to_app_user=${toAppUserId}`
    : "/feedback/";
  const response = await api.get<FeedbackResponse[]>(path);
  return Array.isArray(response) ? response : [];
}

export async function getFeedback(id: number): Promise<FeedbackResponse> {
  const response = await api.get<FeedbackResponse>(`/feedback/${id}/`);
  return response;
}

export async function createFeedback(data: CreateFeedbackRequest): Promise<FeedbackResponse> {
  const response = await api.post<FeedbackResponse>("/feedback/", data);
  return response;
}

export async function updateFeedback(
  id: number,
  data: UpdateFeedbackRequest
): Promise<FeedbackResponse> {
  const response = await api.patch<FeedbackResponse>(`/feedback/${id}/`, data);
  return response;
}

export async function deleteFeedback(id: number): Promise<void> {
  await api.delete(`/feedback/${id}/`);
}

export const feedbackService = {
  listFeedback,
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
};
