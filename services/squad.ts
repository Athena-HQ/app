import { api } from "@/lib/api/api-util";
import type { AppUserResponse } from "./company";

export interface SquadMemberResponse {
  id: number;
  squad: number;
  app_user: AppUserResponse;
  app_user_id?: number;
  role_in_squad: string;
  joined_at: string;
}

export interface SquadResponse {
  id: number;
  name: string;
  company: number;
  leader: AppUserResponse | null;
  leader_id?: number | null;
  project_name: string;
  stack: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  members: SquadMemberResponse[];
  member_count: number;
}

export interface SquadListResponse {
  id: number;
  name: string;
  project_name: string;
  stack: string;
  leader_name: string | null;
  member_count: number;
  is_active: boolean;
}

export interface CreateSquadRequest {
  name: string;
  project_name?: string;
  stack?: string;
  description?: string;
  is_active?: boolean;
  leader_id?: number | null;
}

export type UpdateSquadRequest = CreateSquadRequest;

export const listSquads = async (): Promise<SquadListResponse[]> => {
  const response = await api.get<SquadListResponse[]>("/squads/");
  return Array.isArray(response) ? response : [];
};

export const getMySquads = async (): Promise<SquadListResponse[]> => {
  const response = await api.get<SquadListResponse[]>("/squads/my_squads/");
  return Array.isArray(response) ? response : [];
};

export const getSquad = async (id: number): Promise<SquadResponse> => {
  const response = await api.get<SquadResponse>(`/squads/${id}/`);
  return response;
};

export const createSquad = async (
  data: CreateSquadRequest
): Promise<SquadResponse> => {
  const response = await api.post<SquadResponse>("/squads/", data);
  return response;
};

export const updateSquad = async (
  id: number,
  data: UpdateSquadRequest
): Promise<SquadResponse> => {
  const response = await api.patch<SquadResponse>(`/squads/${id}/`, data);
  return response;
};

export const deleteSquad = async (id: number): Promise<void> => {
  await api.delete(`/squads/${id}/`);
};

export const getSquadMembers = async (
  squadId: number
): Promise<SquadMemberResponse[]> => {
  const response = await api.get<SquadMemberResponse[]>(
    `/squads/${squadId}/members/`
  );
  return Array.isArray(response) ? response : [];
};

export const addSquadMember = async (
  squadId: number,
  data: { app_user_id: number; role_in_squad?: string }
): Promise<SquadMemberResponse> => {
  const response = await api.post<SquadMemberResponse>(
    `/squads/${squadId}/add_member/`,
    { role_in_squad: "developer", ...data }
  );
  return response;
};
