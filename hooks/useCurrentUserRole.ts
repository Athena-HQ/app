import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { getEmployees } from "@/services/company";

const INVITER_ROLES = ["ceo", "hr"];

export function useCurrentUserRole() {
  const { user } = useAuth();
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
    enabled: !!user?.email,
  });
  const currentEmployee = user?.email
    ? employees.find((e) => e.email === user.email)
    : undefined;
  const role = currentEmployee?.role?.toLowerCase() ?? null;
  const canInviteEmployees =
    role !== null && INVITER_ROLES.includes(role);

  return { role, canInviteEmployees, isLoading };
}
