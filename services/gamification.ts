import { api } from "@/lib/api/api-util";

export interface BadgeResponse {
  id: number;
  name: string;
  description: string;
  badge_type: string;
  threshold: number | null;
  icon: string;
  is_active: boolean;
}

export interface EarnedBadgeResponse {
  id: number;
  app_user: { id: number; email: string; first_name: string; last_name: string; role: string | null };
  badge: BadgeResponse;
  earned_at: string;
}

export interface XPTransactionResponse {
  id: number;
  app_user: number;
  amount: number;
  reason: string;
  task: number | null;
  created_at: string;
}

export interface EmployeeXPResponse {
  id: number;
  app_user: { id: number; email: string; first_name: string; last_name: string; role: string | null };
  total_xp: number;
  level: number;
  level_name: string;
  recent_transactions: XPTransactionResponse[];
}

export interface LeaderboardEntryResponse {
  app_user: number;
  user_name: string | null;
  total_xp: number;
  level: number;
  level_name: string;
  badge_count: number;
}

export async function getBadges(): Promise<BadgeResponse[]> {
  const response = await api.get<BadgeResponse[]>("/badges/");
  return Array.isArray(response) ? response : [];
}

export async function getMyBadges(): Promise<EarnedBadgeResponse[]> {
  const response = await api.get<EarnedBadgeResponse[]>(
    "/earned-badges/my_badges/"
  );
  return Array.isArray(response) ? response : [];
}

export async function getMyXp(): Promise<EmployeeXPResponse | null> {
  try {
    const response = await api.get<EmployeeXPResponse>("/xp/my_xp/");
    return response;
  } catch {
    return null;
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntryResponse[]> {
  const response = await api.get<LeaderboardEntryResponse[]>(
    "/xp/leaderboard/"
  );
  return Array.isArray(response) ? response : [];
}

export const gamificationService = {
  getBadges,
  getMyBadges,
  getMyXp,
  getLeaderboard,
};
