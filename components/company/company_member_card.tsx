import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { AppUserResponse } from "@/services/company";

function fullName(employee: AppUserResponse): string {
  const name = `${employee.first_name} ${employee.last_name}`.trim();
  return name || employee.email;
}

function roleLabel(role: string | null): string {
  if (!role) return "Unknown";
  return role;
}

function initials(employee: AppUserResponse): string {
  const first = employee.first_name?.trim()?.[0] ?? "";
  const last = employee.last_name?.trim()?.[0] ?? "";
  const value = `${first}${last}`.toUpperCase();
  return value || employee.email.slice(0, 2).toUpperCase();
}

export function CompanyMemberCard({
  employee,
  compact = false,
}: {
  employee: AppUserResponse;
  compact?: boolean;
}) {
  return (
    <Card className="border-border/70 bg-card py-3 shadow-none">
      <CardContent
        className={`px-6 flex flex-col items-center justify-center ${
          compact ? "py-7 gap-3" : "py-9 gap-4"
        }`}
      >
        <Avatar className={`${compact ? "h-20 w-20" : "h-22 w-22"} border bg-muted/50`}>
          <AvatarFallback className="bg-muted/50 text-3xl font-semibold text-muted-foreground">
            {initials(employee)}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="font-serif text-4 leading-none">{fullName(employee)}</p>
        </div>
        <Badge
          variant="outline"
          className="text-[11px] px-3.5 py-1 uppercase tracking-[0.18em] text-muted-foreground rounded-full"
        >
          {roleLabel(employee.role)}
        </Badge>
      </CardContent>
    </Card>
  );
}
