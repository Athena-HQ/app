import type { CompanyResponse } from "@/services/company";

interface CompanyHeaderProps {
  company: CompanyResponse | null;
}

export function CompanyHeader({ company }: CompanyHeaderProps) {
  if (!company) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide font-sans">
        {company.name}
      </p>
      {/* {company.identifier && (
        <p className="text-xs text-muted-foreground/80 font-mono">
          {company.identifier}
        </p>
      )} */}
    </div>
  );
}
