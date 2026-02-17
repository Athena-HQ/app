import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Users, AlertTriangle } from "lucide-react";
import type { CompanyHierarchyViewModel } from "@/hooks/useCompanyHierarchy";
import { CompanyMemberCard } from "./company_member_card";

function prettifyRole(role: string): string {
  return role
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function CompanyHierarchyLoading() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl">
      <Card className="shadow-none">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-56" />
        </CardHeader>
      </Card>
      {Array.from({ length: 4 }).map((_, idx) => (
        <Card key={idx} className="shadow-none">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-72 w-full rounded-xl" />
              <Skeleton className="h-72 w-full rounded-xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CompanyHierarchyError({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Failed to load company hierarchy
        </CardTitle>
        <CardDescription>
          We could not load your company structure from backend data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onRetry}>Try again</Button>
      </CardContent>
    </Card>
  );
}

export function CompanyHierarchyEmpty() {
  return (
    <Card className="border-dashed shadow-none">
      <CardContent className="py-12 flex flex-col items-center text-center gap-3">
        <Users className="h-10 w-10 text-muted-foreground/50" />
        <p className="font-medium">No employees found in your company yet.</p>
        <p className="text-sm text-muted-foreground">
          Invite teammates to start building your company hierarchy.
        </p>
      </CardContent>
    </Card>
  );
}

export function CompanyHierarchy({ data }: { data: CompanyHierarchyViewModel }) {
  const roleCounts = Object.entries(data.counts.byRole)
    .sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl">
      <Card className="py-2 shadow-none border-0 bg-transparent">
        <CardHeader className="px-0">
          <CardTitle className="font-serif text-5xl tracking-tight">My Company</CardTitle>
          <CardDescription className="uppercase tracking-[0.08em] text-base">
            Company hierarchy
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 flex flex-wrap gap-2 items-center">
          <Badge variant="secondary" className="uppercase tracking-[0.08em]">
            Total: {data.counts.total}
          </Badge>
          {roleCounts.map(([role, count]) => (
            <Badge key={role} variant="outline" className="uppercase tracking-[0.08em]">
              {prettifyRole(role)}: {count}
            </Badge>
          ))}
        </CardContent>
      </Card>

      {data.groups.map((group) => (
        <section key={group.roleKey} className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-3 tracking-[0.08em] uppercase text-muted-foreground">
              {group.roleLabel}
            </h2>
            <Badge variant="outline" className="rounded-full uppercase tracking-[0.1em]">
              {group.members.length} member{group.members.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <Separator />
          <Card className="py-0 border-0 shadow-none bg-transparent">
            <CardContent className="px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.members.map((employee) => (
                  <CompanyMemberCard key={employee.id} employee={employee} />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      ))}

      {data.unassignedRoleMembers.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-3 tracking-[0.08em] uppercase text-muted-foreground">
              Unassigned / Unknown Role
            </h2>
            <Badge variant="outline" className="rounded-full uppercase tracking-[0.1em]">
              {data.unassignedRoleMembers.length} member
              {data.unassignedRoleMembers.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <Separator />
          <Card className="py-0 border-0 shadow-none bg-transparent">
            <CardContent className="px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.unassignedRoleMembers.map((employee) => (
                  <CompanyMemberCard key={employee.id} employee={employee} compact />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
