import { api } from "@/lib/api/api-util";

export interface OnboardingChecklistItemResponse {
  id: number;
  title: string;
  description: string;
  is_completed: boolean;
  completed_at: string | null;
  order: number;
}

export interface OnboardingBuddyResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string | null;
}

export interface OnboardingChecklistResponse {
  id: number;
  app_user: number;
  buddy: OnboardingBuddyResponse | null;
  buddy_id?: number | null;
  is_completed: boolean;
  created_at: string;
  completed_at: string | null;
  items: OnboardingChecklistItemResponse[];
}

export async function getMyChecklist(): Promise<OnboardingChecklistResponse | null> {
  try {
    const response = await api.get<OnboardingChecklistResponse>(
      "/onboarding/my_checklist/"
    );
    return response;
  } catch {
    return null;
  }
}

export async function getChecklist(id: number): Promise<OnboardingChecklistResponse> {
  const response = await api.get<OnboardingChecklistResponse>(
    `/onboarding/${id}/`
  );
  return response;
}

export async function completeChecklistItem(itemId: number): Promise<void> {
  await api.post(`/onboarding-items/${itemId}/complete/`, {});
}

export function checklistResponseToPreview(
  r: OnboardingChecklistResponse
): ChecklistPreview {
  return {
    id: String(r.id),
    title: "Onboarding checklist",
    steps: r.items.map((item) => ({
      id: String(item.id),
      title: item.title,
      description: item.description,
      status: item.is_completed ? "completed" : "pending",
    })),
  };
}

export function buddyResponseToProfile(
  b: OnboardingBuddyResponse | null
): BuddyProfile {
  if (!b) {
    return { name: "—", role: "—", email: "—", timezone: "UTC" };
  }
  const name = `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim() || b.email;
  return {
    name,
    role: b.role ?? "—",
    email: b.email,
    timezone: "UTC",
  };
}

export type OnboardingInvite = {
  token: string;
  email: string;
  fullName: string;
  role: string;
  companyName: string;
  startDate: string;
};

export type RoleFieldDefinition = {
  key: string;
  label: string;
  placeholder: string;
};

export type ChecklistStep = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "completed";
};

export type ChecklistPreview = {
  id: string;
  title: string;
  steps: ChecklistStep[];
};

export type BuddyProfile = {
  name: string;
  role: string;
  email: string;
  timezone: string;
};

type VerifyInviteResponse = {
  invite: OnboardingInvite;
  roleFields: RoleFieldDefinition[];
  checklist: ChecklistPreview;
  buddy: BuddyProfile;
};

type SubmitProfileArgs = {
  token: string;
  profile: OnboardingProfilePayload;
};

export type OnboardingProfilePayload = {
  firstName: string;
  lastName: string;
  preferredName: string;
  timezone: string;
  startDate: string;
  bio: string;
  roleDetails: Record<string, string>;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
};

type SubmitProfileResponse = {
  checklist: ChecklistPreview;
  buddy: BuddyProfile;
};

export const onboardingService = {
  async verifyInvite(token: string | undefined): Promise<VerifyInviteResponse> {
    if (!token) {
      throw new Error("Missing invitation token");
    }
    throw new Error(
      "Use the accept-invitation link from your email to create your account. After logging in, visit Onboarding to complete your checklist."
    );
  },

  async submitProfile(args: SubmitProfileArgs): Promise<SubmitProfileResponse> {
    void args;
    throw new Error(
      "Profile is saved when you accept the invitation. Visit Onboarding after logging in to complete your checklist."
    );
  },

  getMyChecklist,
  getChecklist,
  completeChecklistItem,
};
