import { useCurrentAppUser } from "./useCurrentAppUser";

const INVITER_ROLES = ["ceo", "hr", "company manager"];
const SUPERIOR_ROLES = ["ceo", "hr", "company manager", "cto"];
const ENGINEER_ROLES = ["senior engineer", "junior engineer"];
const ROLE_CHANGER_ROLES = ["company manager", "ceo", "cto"];

export function useCurrentUserRole() {
  const { appUser, isLoading } = useCurrentAppUser();
  const role = appUser?.role?.toLowerCase() ?? null;
  const canInviteEmployees =
    role !== null && INVITER_ROLES.includes(role);
  const canSeeMySquad =
    role !== null && ENGINEER_ROLES.includes(role);
  const canViewCompanyOrg = role === "company manager";
  const isCompanyManager = role === "company manager";
  const isSuperior = role !== null && SUPERIOR_ROLES.includes(role);
  const canChangeRoles = role !== null && ROLE_CHANGER_ROLES.includes(role);

  return { role, canInviteEmployees, canSeeMySquad, canViewCompanyOrg, isCompanyManager, isSuperior, canChangeRoles, isLoading };
}
