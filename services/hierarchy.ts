export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  managerId?: string;
}

const ROLE_HIERARCHY: Record<string, number> = {
  "company manager": 1,
  ceo: 2,
  cto: 3,
  hr: 4,
  "senior engineer": 5,
  "junior engineer": 6,
};

let mockUsers: User[] = [];

export function getRoleHierarchyLevel(role: string): number {
  const normalized = role?.toLowerCase?.() ?? "";
  return ROLE_HIERARCHY[normalized] ?? 999;
}

export function canAssignTaskByRole(assignerRole: string, assigneeRole: string): boolean {
  if (!assignerRole || !assigneeRole) return false;
  if (assignerRole === assigneeRole) return false;
  const assignerLevel = getRoleHierarchyLevel(assignerRole);
  const assigneeLevel = getRoleHierarchyLevel(assigneeRole);
  if (assignerLevel >= assigneeLevel) return false;
  return true;
}

export function getUserById(userId: string): User | undefined {
  return mockUsers.find((u) => u.id === userId);
}

export function getSubordinates(userId: string): User[] {
  const user = getUserById(userId);
  if (!user) return [];

  return mockUsers.filter((u) => u.managerId === userId);
}

export function canAssignTask(assignerId: string, assigneeId: string): boolean {
  const assigner = getUserById(assignerId);
  const assignee = getUserById(assigneeId);

  if (!assigner || !assignee) return false;

  if (assignerId === assigneeId) return false;

  const assignerLevel = getRoleHierarchyLevel(assigner.role);
  const assigneeLevel = getRoleHierarchyLevel(assignee.role);

  if (assignerLevel >= assigneeLevel) return false;

  const isDirectReport = assignee.managerId === assignerId;

  return isDirectReport || assignerLevel < assigneeLevel;
}

export function setEmployeesForHierarchy(employees: { id: number; email: string; first_name: string; last_name: string; role: string | null }[]): void {
  mockUsers = employees.map((e) => ({
    id: String(e.id),
    name: `${e.first_name} ${e.last_name}`.trim() || e.email,
    email: e.email,
    role: e.role ?? "junior engineer",
  }));
}

export function getAllUsers(): User[] {
  return [...mockUsers];
}

export function getCurrentUser(): User {
  return (
    mockUsers[0] ?? {
      id: "0",
      name: "Current User",
      email: "",
      role: "junior engineer",
    }
  );
}

