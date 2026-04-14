"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { AppUserResponse } from "@/services/company";
<<<<<<< HEAD
import Link from "next/link";
=======
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RiMessage3Line } from "@remixicon/react";
>>>>>>> 251c361 (finish tested and fixing chat issues)

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
  const isManager = employee.role?.toLowerCase() === "company manager";
  const { user } = useAuth();
  const router = useRouter();

  const handleChatClick = () => {
    router.push(`/chat?new_dm=${employee.user_id}`);
  };

  return (
<<<<<<< HEAD
    <Link href={`/employees/${employee.id}`} className="block">
      <Card 
        className={`border-border/70 bg-card py-2 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer ${
          isManager ? "border-primary/20 bg-primary/5" : ""
=======
    <Card 
      className={`relative border-border/70 bg-card py-2 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
        isManager ? "border-primary/20 bg-primary/5" : ""
      }`}
    >
      <CardContent
        className={`px-4 flex flex-col items-center justify-center ${
          isManager ? "py-6 gap-3" : compact ? "py-4 gap-2" : "py-5 gap-2.5"
>>>>>>> 251c361 (finish tested and fixing chat issues)
        }`}
      >
        <CardContent
          className={`px-4 flex flex-col items-center justify-center ${
            isManager ? "py-6 gap-3" : compact ? "py-4 gap-2" : "py-5 gap-2.5"
          }`}
        >
<<<<<<< HEAD
          <Avatar className={`${isManager ? "h-20 w-20" : "h-14 w-14"} border bg-background shadow-sm`}>
            <AvatarFallback className={`${isManager ? "text-2xl" : "text-lg"} font-semibold text-muted-foreground`}>
              {initials(employee)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center mt-1">
            <p className={`font-serif leading-none ${isManager ? "text-lg font-medium" : "text-base"}`}>
              {fullName(employee)}
            </p>
          </div>
          <Badge
            variant={isManager ? "default" : "secondary"}
            className={`uppercase tracking-widest rounded-full mt-1 ${isManager ? "text-[11px] px-3 py-1" : "text-[10px] px-2 py-0.5"}`}
          >
            {roleLabel(employee.role)}
          </Badge>
        </CardContent>
      </Card>
    </Link>
=======
          {roleLabel(employee.role)}
        </Badge>
        {user && user.pk !== employee.user_id && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
            onClick={handleChatClick}
            title={`Chat with ${employee.first_name}`}
          >
            <RiMessage3Line size={18} />
          </Button>
        )}
      </CardContent>
    </Card>
>>>>>>> 251c361 (finish tested and fixing chat issues)
  );
}
