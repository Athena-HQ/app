import { useCurrentAppUser } from "./useCurrentAppUser";

const INVITER_ROLES = ["ceo", "hr", "company manager"];
const ENGINEER_ROLES = ["senior engineer", "junior engineer"];

export function useCurrentUserRole() {
  const { appUser, isLoading } = useCurrentAppUser();
  const role = appUser?.role?.toLowerCase() ?? null;
  const canInviteEmployees =
    role !== null && INVITER_ROLES.includes(role);
  const canSeeMySquad =
    role !== null && ENGINEER_ROLES.includes(role);
  const canViewCompanyOrg = role === "company manager";

  return { role, canInviteEmployees, canSeeMySquad, canViewCompanyOrg, isLoading };
}
