"use client";

import { useSquadCreate } from '@/hooks/useSquadCreate'; 
import { SquadForm } from "@/components/squad/squad_form";
import { 
  Briefcase, 
  Code, 
  Terminal, 
  Bug, 
  Palette, 
  Server,
} from "lucide-react";
import type { RoleDefinition } from "@/components/squad/role_builder";

const roleDefinitions: readonly RoleDefinition[] = [
  { role: "Project Manager", icon: Briefcase, color: "#3B82F6", max: 2 },
  { role: "Senior Engineer", icon: Code, color: "#8B5CF6", max: 5 },
  { role: "Junior Engineer", icon: Terminal, color: "#10B981", max: 10 },
  { role: "QA Engineer", icon: Bug, color: "#EF4444", max: 3 },
  { role: "UI/UX Designer", icon: Palette, color: "#EC4899", max: 2 },
  { role: "DevOps Engineer", icon: Server, color: "#F97316", max: 2 },
] as const;

const roleColors = roleDefinitions.reduce((acc, curr) => ({ ...acc, [curr.role]: curr.color }), {} as Record<string, string>);

export default function CreateSquadPage() {
  const { form, onSubmit, isSubmitting } = useSquadCreate();
  const isEditing = false;

  return (
    <SquadForm
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      isEditing={isEditing}
      roleDefinitions={roleDefinitions}
      roleColors={roleColors}
    />
  );
}
