"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { AppUserResponse } from "@/services/company";

interface EmployeeCardProps {
  employee: AppUserResponse;
  roleLabel: string;
  className?: string;
}

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
  const initials = getInitials(
    employee.first_name,
    employee.last_name,
    employee.email
  );
  const avatarUrl = employee.profile?.avatar_url;

  return (
    <Link
      href={`/employees/${employee.id}`}
      className={cn(
        "block group relative overflow-hidden rounded-xl border border-border/60 bg-card/80 p-5 cursor-pointer",
        "backdrop-blur-[2px] shadow-[0_6px_20px_-14px_hsl(var(--foreground)/0.35)]",
        "transition-all duration-300 ease-out",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(155deg,hsl(var(--background)/0.6)_0%,hsl(var(--muted)/0.18)_45%,hsl(var(--background)/0.72)_100%)] before:opacity-80",
        "hover:border-border hover:bg-card/90 hover:shadow-[0_10px_28px_-14px_hsl(var(--foreground)/0.45)]",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        className
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
  );
}
