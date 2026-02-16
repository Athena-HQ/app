import { api } from "@/lib/api/api-util";

export type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";

export type InvitationRole =
  | "company manager"
  | "ceo"
  | "cto"
  | "hr"
  | "senior engineer"
  | "junior engineer";

export interface InvitationResponse {
  id: number;
  email: string;
  role: InvitationRole;
  company: number;
  company_name: string;
  invited_by: { id: number; email: string; first_name: string; last_name: string; role: string | null };
  token?: string;
  status: InvitationStatus;
  created_at: string;
  expires_at: string;
}

export interface InvitationFormData {
  email: string;
  role: InvitationRole;
}

export interface CreateInvitationPayload extends InvitationFormData {
  company: number;
}

export interface AcceptInvitationRequest {
  first_name: string;
  last_name: string;
  password: string;
  token?: string;
}

export const INVITATION_ROLES: InvitationRole[] = [
  "company manager",
  "ceo",
  "cto",
  "hr",
  "senior engineer",
  "junior engineer",
];

export const TEAM_ROLES = INVITATION_ROLES;

export async function listInvitations(): Promise<InvitationResponse[]> {
  const response = await api.get<InvitationResponse[]>("/invitations/");
  return Array.isArray(response) ? response : [];
}

export async function createInvitation(
  data: CreateInvitationPayload
): Promise<InvitationResponse> {
  const response = await api.post<InvitationResponse>("/invitations/", data);
  return response;
}

export async function getInvitation(id: number): Promise<InvitationResponse> {
  const response = await api.get<InvitationResponse>(`/invitations/${id}/`);
  return response;
}

export async function deleteInvitation(id: number): Promise<void> {
  await api.delete(`/invitations/${id}/`);
}

export async function resendInvitation(id: number): Promise<void> {
  await api.post(`/invitations/${id}/resend/`, {});
}

export async function cancelInvitation(id: number): Promise<void> {
  await api.post(`/invitations/${id}/cancel/`, {});
}

export async function acceptInvitation(
  key: string,
  data: AcceptInvitationRequest
): Promise<{ detail: string }> {
  const body = { ...data, token: key };
  const response = await api.post<{ detail: string }>(
    `/invitations/accept/?key=${encodeURIComponent(key)}`,
    body
  );
  return response;
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  status: InvitationStatus;
  sentAt: Date;
  expiresAt: Date;
}

export function invitationResponseToInvitation(
  r: InvitationResponse
): Invitation {
  return {
    id: String(r.id),
    email: r.email,
    role: r.role,
    status: r.status,
    sentAt: new Date(r.created_at),
    expiresAt: new Date(r.expires_at),
  };
}

export const invitationService = {
  async getInvitations(): Promise<InvitationResponse[]> {
    return listInvitations();
  },

  async sendInvitation(
    data: InvitationFormData,
    companyId: number
  ): Promise<InvitationResponse> {
    return createInvitation({ ...data, company: companyId });
  },

  async resendInvitation(id: string): Promise<void> {
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) throw new Error("Invalid invitation id");
    return resendInvitation(numId);
  },

  async deleteInvitation(id: string): Promise<void> {
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) throw new Error("Invalid invitation id");
    return deleteInvitation(numId);
  },

  async cancelInvitation(id: string): Promise<void> {
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) throw new Error("Invalid invitation id");
    return cancelInvitation(numId);
  },

  async bulkInvite(
    invitations: InvitationFormData[],
    companyId: number
  ): Promise<InvitationResponse[]> {
    const results: InvitationResponse[] = [];
    for (const data of invitations) {
      const created = await createInvitation({ ...data, company: companyId });
      results.push(created);
    }
    return results;
  },
};
