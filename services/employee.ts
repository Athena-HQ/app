import { api } from "@/lib/api/api-util";
import type { AppUserResponse } from "./company";

// ─── Detail Response (from AppUserDetailSerializer) ─────────────────────────

export interface EarnedBadge {
  id: number;
  name: string;
  description: string;
  badge_type: string;
  icon: string;
  earned_at: string;
}

export interface EmployeeDetailResponse extends AppUserResponse {
  task_count: number;
  completed_task_count: number;
  average_rating: number | null;
  badge_count: number;
  badges: EarnedBadge[];
  xp_info: {
    total_xp: number;
    level: number;
    level_name: string;
  } | null;
}

// ─── Profile Response (from authentication/profile/) ────────────────────────

export interface ProfileResponse {
  id: number;
  first_name: string;
  last_name: string;
  bio: string;
  linkedin: string | null;
  github: string | null;
  twitter: string | null;
  avatar_url: string | null;
  social_links: { platform: string; url: string }[];
  skills: string[];
}

export interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  bio?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  avatar_url?: string;
  social_links?: { platform: string; url: string }[];
  skills?: string[];
}

// ─── API Functions ──────────────────────────────────────────────────────────

/** Get an employee's detail profile (computed stats, badges, XP, etc.) */
export async function getEmployeeDetail(id: number): Promise<EmployeeDetailResponse> {
  return api.get<EmployeeDetailResponse>(`/company/employees/${id}/`);
}

/** Get the current user's own profile (for settings editing) */
export async function getMyProfile(): Promise<ProfileResponse> {
  return api.get<ProfileResponse>("/authentication/profile/");
}

/** Update the current user's profile fields */
export async function updateMyProfile(data: ProfileUpdateRequest): Promise<ProfileResponse> {
  return api.patch<ProfileResponse>("/authentication/profile/", data);
}

export async function changeEmployeeRole(employeeId: number, role: string): Promise<void> {
  await api.patch(`/authentication/employees/${employeeId}/change-role/`, { role });
}

export const employeeService = {
  getEmployeeDetail,
  getMyProfile,
  updateMyProfile,
  changeEmployeeRole,
};
