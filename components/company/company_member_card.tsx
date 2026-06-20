"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import type { AppUserResponse } from "@/services/company";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useChatDrawer } from "@/contexts/chat-drawer-context";
import { RiMessage3Line } from "@remixicon/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { changeEmployeeRole } from "@/services/employee";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";

const ROLE_OPTIONS = [
  { value: "ceo", label: "CEO" },
  { value: "cto", label: "CTO" },
  { value: "hr", label: "HR" },
  { value: "senior engineer", label: "Senior Engineer" },
  { value: "junior engineer", label: "Junior Engineer" },
];

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
  const { openDrawer } = useChatDrawer();
  const { canChangeRoles } = useCurrentUserRole();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(employee.role ?? "");

  const { mutate: changeRole, isPending } = useMutation({
    mutationFn: (role: string) => changeEmployeeRole(employee.id, role),
    onSuccess: () => {
      toast.success("Role updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setDialogOpen(false);
    },
    onError: () => toast.error("Failed to update role."),
  });

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openDrawer(String(employee.user_id));
  };

  const showChangeRole = canChangeRoles && !isManager;

  return (
    <>
      <Card
        className={`relative border-border/70 bg-card py-2 shadow-sm transition-all hover:shadow-md ${
          isManager ? "border-primary/20 bg-primary/5" : ""
        }`}
      >
        <Link href={`/employees/${employee.id}`} className="block">
          <CardContent
            className={`px-4 flex flex-col items-center justify-center ${
              isManager ? "py-6 gap-3" : compact ? "py-4 gap-2" : "py-5 gap-2.5"
            }`}
          >
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
        </Link>

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

        {showChangeRole && (
          <div className="px-4 pb-3">
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
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Change Role — {fullName(employee)}</DialogTitle>
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
    </>
  );
}
