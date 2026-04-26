import { api } from "@/lib/api/api-util";

export interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  bio?: string;
}

export interface SocialLinkPayload {
  id: string;
  platform: string;
  value: string;
  visible: boolean;
}

// TODO: backend endpoint needed — PATCH /employees/{id}/profile/ accepting { first_name, last_name, bio }
export async function updateEmployeeProfile(
  userId: number,
  data: ProfileUpdateRequest
): Promise<void> {
  await api.patch(`/employees/${userId}/profile/`, data);
}

// TODO: backend endpoint needed — PUT /employees/{id}/social-links/ accepting SocialLinkPayload[]
export async function updateSocialLinks(
  userId: number,
  links: SocialLinkPayload[]
): Promise<void> {
  await api.put(`/employees/${userId}/social-links/`, links);
}

// TODO: backend endpoint needed — POST /company/{id}/transfer-ownership/ accepting { new_manager_id }
export async function transferOwnership(
  companyId: number,
  newManagerId: number
): Promise<void> {
  await api.post(`/company/${companyId}/transfer-ownership/`, {
    new_manager_id: newManagerId,
  });
}

// TODO: backend endpoint needed — POST /company/{id}/archive/ (no body required)
export async function archiveCompany(companyId: number): Promise<void> {
  await api.post(`/company/${companyId}/archive/`);
}

// TODO: backend endpoint needed — DELETE /company/{id}/ (hard delete, irreversible)
export async function deleteCompany(companyId: number): Promise<void> {
  await api.delete(`/company/${companyId}/`);
}
