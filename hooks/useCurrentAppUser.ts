import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { getEmployees, type AppUserResponse } from "@/services/company";

export interface CurrentAppUser {
  id: number;
  name: string;
  email: string;
  role: string | null;
  raw: AppUserResponse;
}

function buildName(employee: AppUserResponse): string {
  const fullName = `${employee.first_name} ${employee.last_name}`.trim();
  return fullName || employee.email;
}

export function useEmployees() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
    enabled: !!user?.email,
    staleTime: 1000 * 60 * 5,
  });

  return {
    employees: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
  };
}

export function useCurrentAppUser() {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { employees, isLoading: isEmployeesLoading, error } = useEmployees();

  let appUser: CurrentAppUser | null = null;
  if (user?.email) {
    const employee = employees.find((entry) => entry.email === user.email);
    if (employee) {
      appUser = {
        id: employee.id,
        name: buildName(employee),
        email: employee.email,
        role: employee.role,
        raw: employee,
      };
    }
  }

  return {
    appUser,
    isLoading: isAuthLoading || (isAuthenticated && isEmployeesLoading),
    isAuthenticated,
    isMissingEmployee: Boolean(user?.email) && !isEmployeesLoading && !appUser,
    error,
  };
}

export function useAssignableUsers() {
  const { appUser, isLoading, isMissingEmployee, error } = useCurrentAppUser();
  const { employees, isLoading: isEmployeesLoading } = useEmployees();

  const assignableUsers = appUser
    ? employees.map((employee) => ({
        id: String(employee.id),
        name: buildName(employee),
        role: employee.role,
        isCurrentUser: employee.id === appUser.id,
      }))
    : [];

  return {
    assignableUsers,
    appUser,
    isLoading: isLoading || isEmployeesLoading,
    isMissingEmployee,
    error,
  };
}
