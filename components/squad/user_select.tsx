"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getEmployees } from "@/services/company";

function mapEmployeeToOption(
  e: { id: number; first_name: string; last_name: string; email: string; role: string | null; profile?: { avatar_url?: string } }
) {
  const name =
    [e.first_name, e.last_name].filter(Boolean).join(" ").trim() || e.email;
  return {
    id: String(e.id),
    name,
    role: e.role ?? "Member",
    avatarUrl: e.profile?.avatar_url,
  };
}

interface UserSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function UserSelect({ value, onChange }: UserSelectProps) {
  const [open, setOpen] = useState(false);

  const { data: employees = [], isLoading, isError } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });

  const users = employees.map(mapEmployeeToOption);
  const selectedUser = users.find((user) => user.id === value);

  const triggerLabel = isLoading
    ? "Loading team members..."
    : selectedUser
      ? null
      : "Search for a team member...";

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex-1 justify-between bg-background/50 border-border/60 hover:bg-background hover:border-accent/50 h-14 px-4"
          >
            {selectedUser ? (
              <div className="flex items-center gap-3 text-left">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback>
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium leading-none text-foreground">
                    {selectedUser.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {selectedUser.role}
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">{triggerLabel}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search name or role..." />
            <CommandList>
              <CommandEmpty>
                {isError ? "Unable to load team members." : "No user found."}
              </CommandEmpty>
              <CommandGroup heading="Available Leaders">
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.name}
                    onSelect={() => {
                      onChange(value === user.id ? "" : user.id);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 p-2 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.role}
                      </div>
                    </div>
                    {value === user.id && (
                      <Badge
                        variant="outline"
                        className="ml-auto text-xs border-accent text-accent-foreground"
                      >
                        Selected
                      </Badge>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
