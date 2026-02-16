import { getRoleHierarchyLevel } from "@/services/hierarchy";
import type { AppUserResponse } from "@/services/company";

const ROLE_LABELS: Record<string, string> = {
  "company manager": "Company Manager",
  ceo: "CEO",
  cto: "CTO",
  hr: "HR",
  "senior engineer": "Senior Engineer",
  "junior engineer": "Junior Engineer",
};

export interface HierarchyTier {
  level: number;
  label: string;
  employees: AppUserResponse[];
}

function formatRoleLabel(role: string): string {
  const normalized = role?.toLowerCase?.() ?? "";
  return ROLE_LABELS[normalized] ?? role;
}

export function buildHierarchyTiers(employees: AppUserResponse[]): HierarchyTier[] {
  const byLevel = new Map<number, AppUserResponse[]>();
  for (const e of employees) {
    const role = e.role ?? "junior engineer";
    const level = getRoleHierarchyLevel(role);
    if (!byLevel.has(level)) byLevel.set(level, []);
    byLevel.get(level)!.push(e);
  }
  const levels = Array.from(byLevel.keys()).sort((a, b) => a - b);
  const tiers: HierarchyTier[] = [];
  for (const level of levels) {
    const list = byLevel.get(level)!;
    const sorted = [...list].sort((a, b) => {
      const aName = `${a.first_name} ${a.last_name}`.trim() || a.email;
      const bName = `${b.first_name} ${b.last_name}`.trim() || b.email;
      return aName.localeCompare(bName);
    });
    const roleLabel = list[0]?.role ? formatRoleLabel(list[0].role) : "Member";
    tiers.push({ level, label: roleLabel, employees: sorted });
  }
  return tiers;
}
