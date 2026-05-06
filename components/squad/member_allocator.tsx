import { UserSelect } from "./user_select";
import { Label } from "@/components/ui/label";

interface MemberAllocatorProps {
  roles?: Record<string, number>;
  members?: { app_user_id: number; role_in_squad: string }[];
  onChange: (members: { app_user_id: number; role_in_squad: string }[]) => void;
}

export function MemberAllocator({ roles = {}, members = [], onChange }: MemberAllocatorProps) {
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
              <div key={`${role}-${i}`} className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground px-1">
                  Slot {i + 1}
                </span>
                <UserSelect
                  value={getUserIdForSlot(role, i)}
                  onChange={(val) => handleSelect(role, i, val)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
