import { updateMyProfile, type ProfileUpdateRequest } from "./employee";

export type { ProfileUpdateRequest };

// Re-export under the same function names the settings UI already uses
export async function updateEmployeeProfile(
  _userId: number,
  data: ProfileUpdateRequest
): Promise<void> {
  await updateMyProfile(data);
}

export async function updateSocialLinks(
  _userId: number,
  links: { id: string; platform: string; value: string; visible: boolean }[]
): Promise<void> {
  // Map the social links editor format to flat profile fields
  const payload: ProfileUpdateRequest = {};
  for (const link of links) {
    const p = link.platform.toLowerCase();
    if (p === "github" && link.value) payload.github = link.value;
    else if (p === "linkedin" && link.value) payload.linkedin = link.value;
    else if (p === "twitter" && link.value) payload.twitter = link.value;
  }
  await updateMyProfile(payload);
}

// TODO: these still need backend endpoints
export async function transferOwnership(
  companyId: number,
  newManagerId: number
): Promise<void> {
  const { api } = await import("@/lib/api/api-util");
  await api.post(`/company/${companyId}/transfer-ownership/`, {
    new_manager_id: newManagerId,
  });
}

export async function archiveCompany(companyId: number): Promise<void> {
  const { api } = await import("@/lib/api/api-util");
  await api.post(`/company/${companyId}/archive/`);
}

export async function deleteCompany(companyId: number): Promise<void> {
  const { api } = await import("@/lib/api/api-util");
  await api.delete(`/company/${companyId}/`);
}
