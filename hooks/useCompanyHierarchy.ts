import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEmployees, type AppUserResponse } from "@/services/company";

interface RoleGroup {
  roleKey: string;
  roleLabel: string;
  rank: number;
  members: AppUserResponse[];
}

export interface CompanyHierarchyViewModel {
  allEmployees: AppUserResponse[];
  groups: RoleGroup[];
  unassignedRoleMembers: AppUserResponse[];
  counts: {
    total: number;
    byRole: Record<string, number>;
  };
}

const ROLE_CONFIG: Record<string, { label: string; rank: number }> = {
  "company manager": { label: "Company Manager", rank: 1 },
  ceo: { label: "CEO", rank: 2 },
  cto: { label: "CTO", rank: 3 },
  hr: { label: "HR", rank: 3 },
  "senior engineer": { label: "Senior Engineer", rank: 4 },
  "junior engineer": { label: "Junior Engineer", rank: 5 },
};

function normalizeRole(role: string | null): string | null {
  if (!role) return null;
  const value = role.trim().toLowerCase();
  return value.length > 0 ? value : null;
}

function employeeSort(a: AppUserResponse, b: AppUserResponse): number {
  const byFirst = (a.first_name || "").localeCompare(b.first_name || "");
  if (byFirst !== 0) return byFirst;

  const byLast = (a.last_name || "").localeCompare(b.last_name || "");
  if (byLast !== 0) return byLast;

  return a.email.localeCompare(b.email);
}

function buildHierarchy(employees: AppUserResponse[]): CompanyHierarchyViewModel {
  const sortedEmployees = [...employees].sort(employeeSort);
  const byRole: Record<string, number> = {};
  const grouped = new Map<string, RoleGroup>();
  const unassignedRoleMembers: AppUserResponse[] = [];

  for (const employee of sortedEmployees) {
    const role = normalizeRole(employee.role);

    if (!role || !ROLE_CONFIG[role]) {
      unassignedRoleMembers.push(employee);
      continue;
    }

    byRole[role] = (byRole[role] ?? 0) + 1;

    const existing = grouped.get(role);
    if (existing) {
      existing.members.push(employee);
      continue;
    }

    const config = ROLE_CONFIG[role];
    grouped.set(role, {
      roleKey: role,
      roleLabel: config.label,
      rank: config.rank,
      members: [employee],
    });
  }

  const groups = Array.from(grouped.values()).sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.roleLabel.localeCompare(b.roleLabel);
  });

  return {
    allEmployees: sortedEmployees,
    groups,
    unassignedRoleMembers,
    counts: {
      total: sortedEmployees.length,
      byRole,
    },
  };
}

export function useCompanyHierarchy() {
  const query = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
    staleTime: 1000 * 60 * 5,
  });

  const data = useMemo(
    () => buildHierarchy(query.data ?? []),
    [query.data]
  );

  return {
    data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
