import { api } from "@/lib/api/api-util";

export interface NotificationResponse {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_task: number | null;
  related_feedback: number | null;
  triggered_by: number | null;
  triggered_by_name: string | null;
  created_at: string;
}

export interface UnreadCountResponse {
  count: number;
}

export async function listNotifications(): Promise<NotificationResponse[]> {
  const response = await api.get<NotificationResponse[]>("/notifications/");
  return Array.isArray(response) ? response : [];
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  return api.get<UnreadCountResponse>("/notifications/unread_count/");
}

export async function markAsRead(id: number): Promise<NotificationResponse> {
  return api.post<NotificationResponse>(`/notifications/${id}/mark_read/`);
}

export async function markAllAsRead(): Promise<{ updated: number }> {
  return api.post<{ updated: number }>("/notifications/mark_all_read/");
}

export const notificationService = {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
