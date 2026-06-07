import { useState } from "react";
import { UserSelect } from "./user_select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAISquadMemberSuggestions } from "@/hooks/useAISquadMemberSuggestions";
import { AISquadMemberSuggestionsPanel } from "./ai_squad_member_panel";

interface MemberAllocatorProps {
  roles?: Record<string, number>;
  members?: { app_user_id: number; role_in_squad: string }[];
  onChange: (members: { app_user_id: number; role_in_squad: string }[]) => void;
  techStack?: string[];
  squadDescription?: string;
}

function MemberSlot({
  roleName,
  slotIndex,
  value,
  onChange,
  members,
  techStack,
  squadDescription,
}: {
  roleName: string;
  slotIndex: number;
  value: string;
  onChange: (val: string) => void;
  members: { app_user_id: number; role_in_squad: string }[];
  techStack: string[];
  squadDescription: string;
}) {
  const [showAI, setShowAI] = useState(false);

  const { suggestions, loading, error, trigger } = useAISquadMemberSuggestions({
    roleName,
    stack: techStack.join(", "),
    description: squadDescription,
    excludeEmployeeIds: members.map((m) => m.app_user_id.toString()),
  });

  const handleTriggerAI = () => {
    setShowAI(true);
    trigger();
  };

  const handlePick = (employeeId: number) => {
    onChange(employeeId.toString());
    setShowAI(false);
  };

  const isConfigured = !!techStack || !!squadDescription;

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-xl bg-background/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Slot {slotIndex + 1}
        </span>
        {!showAI && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleTriggerAI}
            className="h-7 text-xs gap-1.5 text-violet-500 hover:text-violet-600 hover:bg-violet-500/10"
            disabled={!isConfigured}
          >
            <Sparkles className="w-3 h-3" />
            Suggest Member
          </Button>
        )}
      </div>

      <UserSelect value={value} onChange={onChange} />

      {showAI && (
        <div className="mt-2 pt-4 border-t">
          <AISquadMemberSuggestionsPanel
            suggestions={suggestions}
            loading={loading}
            error={error}
            onTrigger={trigger}
            onPick={handlePick}
            disabled={!isConfigured}
          />
        </div>
      )}
    </div>
  );
}

export function MemberAllocator({
  roles = {},
  members = [],
  onChange,
  techStack = [],
  squadDescription = "",
}: MemberAllocatorProps) {
  const roleEntries = Object.entries(roles).filter(([, count]) => count > 0);

  if (roleEntries.length === 0) {
    return (
      <p className="text-sm text-foreground/70">
        Please define required roles above to allocate members.
      </p>
    );
  }

  const handleSelect = (roleName: string, index: number, userIdStr: string) => {
    const userId = parseInt(userIdStr, 10);
    const newMembers = [...members];

    const membersWithRoleIdxs = newMembers
      .map((m, idx) => (m.role_in_squad === roleName ? idx : -1))
      .filter((idx) => idx !== -1);

    const targetIdx = membersWithRoleIdxs[index];

    if (isNaN(userId)) {
      if (targetIdx !== undefined) {
        newMembers.splice(targetIdx, 1);
        onChange(newMembers);
      }
    } else {
      if (targetIdx !== undefined) {
        newMembers[targetIdx].app_user_id = userId;
      } else {
        newMembers.push({ app_user_id: userId, role_in_squad: roleName });
      }
      onChange(newMembers);
    }
  };

  const getUserIdForSlot = (roleName: string, index: number) => {
    const membersWithRole = members.filter((m) => m.role_in_squad === roleName);
    return membersWithRole[index]?.app_user_id?.toString() || "";
  };

  return (
    <div className="space-y-6">
      {roleEntries.map(([role, count]) => (
        <div key={role} className="space-y-3">
          <Label className="text-base text-foreground font-medium block">
            {role} Team
          </Label>
          <div className="flex flex-col gap-4">
            {Array.from({ length: count }).map((_, i) => (
              <MemberSlot
                key={`${role}-${i}`}
                roleName={role}
                slotIndex={i}
                value={getUserIdForSlot(role, i)}
                onChange={(val) => handleSelect(role, i, val)}
                members={members}
                techStack={techStack}
                squadDescription={squadDescription}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

