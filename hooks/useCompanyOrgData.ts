import { useQuery } from "@tanstack/react-query";
import { getEmployees, getCompany } from "@/services/company";
import type { AppUserResponse, CompanyResponse } from "@/services/company";
import { buildHierarchyTiers } from "@/lib/company_hierarchy";
import type { HierarchyTier } from "@/lib/company_hierarchy";

export function useCompanyOrgData(): {
  employees: AppUserResponse[];
  company: CompanyResponse | null;
  tiers: HierarchyTier[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} {
  const {
    data: employees = [],
    isLoading: employeesLoading,
    isError: employeesError,
    error: employeesErr,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const companyId = employees[0]?.company ?? null;
  const { data: company = null, isLoading: companyLoading } = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => getCompany(companyId!),
    enabled: !!companyId,
  });

  const tiers = buildHierarchyTiers(employees);
  const isLoading = employeesLoading || (!!companyId && companyLoading);

  return {
    employees,
    company: company ?? null,
    tiers,
    isLoading,
    isError: employeesError,
    error: employeesErr as Error | null,
  };
}
