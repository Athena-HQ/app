"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { changeEmployeeRole } from "@/services/employee";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import type { AppUserResponse } from "@/services/company";

interface EmployeeCardProps {
  employee: AppUserResponse;
  roleLabel: string;
  className?: string;
}

const ROLE_OPTIONS = [
  { value: "ceo", label: "CEO" },
  { value: "cto", label: "CTO" },
  { value: "hr", label: "HR" },
  { value: "senior engineer", label: "Senior Engineer" },
  { value: "junior engineer", label: "Junior Engineer" },
];

function getInitials(first: string, last: string, email: string): string {
  const trimmed = `${first} ${last}`.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2)
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return trimmed.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function EmployeeCard({ employee, roleLabel, className }: EmployeeCardProps) {
  const name = `${employee.first_name} ${employee.last_name}`.trim() || employee.email;
  const initials = getInitials(employee.first_name, employee.last_name, employee.email);
  const avatarUrl = employee.profile?.avatar_url;

  const { canChangeRoles } = useCurrentUserRole();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(employee.role ?? "");
  const queryClient = useQueryClient();

  const { mutate: changeRole, isPending } = useMutation({
    mutationFn: (role: string) => changeEmployeeRole(employee.id, role),
    onSuccess: () => {
      toast.success("Role updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setDialogOpen(false);
    },
    onError: () => toast.error("Failed to update role."),
  });

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/60 bg-card/80",
        "backdrop-blur-[2px] shadow-[0_6px_20px_-14px_hsl(var(--foreground)/0.35)]",
        className
      )}
    >
      <Link
        href={`/employees/${employee.id}`}
        className={cn(
          "block group p-5 cursor-pointer",
          "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(155deg,hsl(var(--background)/0.6)_0%,hsl(var(--muted)/0.18)_45%,hsl(var(--background)/0.72)_100%)] before:opacity-80",
          "transition-all duration-300 ease-out",
          "hover:bg-card/90",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background"
        )}
      >
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2.5 text-center">
            <Avatar className="h-14 w-14 ring-1 ring-border/60 transition-colors duration-300 group-hover:ring-border">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
              <AvatarFallback className="bg-muted/75 text-sm font-semibold tracking-tight text-muted-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-1">
              <p
                className="truncate font-serif text-base font-semibold leading-tight text-card-foreground tracking-tight"
                title={name}
              >
                {name}
              </p>
              <span
                className="inline-flex max-w-full truncate rounded-full border border-border/50 bg-background/70 px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.14em] text-muted-foreground"
                title={roleLabel}
              >
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {canChangeRoles && employee.role !== "company manager" && (
        <div className="relative z-10 px-5 pb-4">
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-7"
            onClick={() => {
              setSelectedRole(employee.role ?? "");
              setDialogOpen(true);
            }}
          >
            Change Role
          </Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Change Role — {name}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={isPending || !selectedRole}
              onClick={() => changeRole(selectedRole)}
            >
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
