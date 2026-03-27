import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { createSquad, updateSquad, getSquad } from "@/services/squad";
import { ApiError } from "@/lib/api/api-util";

export const squadSchema = z.object({
  squadName: z.string().min(3, "Squad name must be at least 3 characters"),
  squadDescription: z.string().optional(),
  techStack: z.array(z.string()).min(1, "Select at least one technology"),
  squadLeader: z.string().min(1, "Squad leader is required"),
  roles: z.record(z.string(), z.number()),
  members: z.array(z.object({
    app_user_id: z.number(),
    role_in_squad: z.string()
  })).optional(),
});

export type SquadFormValues = z.infer<typeof squadSchema>;

export type SquadFormInitialValues = Partial<SquadFormValues> & {
  squadId?: number;
};

export function useSquadCreate(initialValues?: SquadFormInitialValues) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const squadId = initialValues?.squadId;

  const createMutation = useMutation({
    mutationFn: (data: SquadFormValues) =>
      createSquad({
        name: data.squadName,
        description: data.squadDescription ?? "",
        stack: data.techStack.join(", "),
        squad_lead_id: data.squadLeader ? parseInt(data.squadLeader, 10) : null,
        team_composition: data.roles,
        member_ids: data.members,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["squads"] });
      toast.success("Squad created");
      router.push("/squads");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SquadFormValues }) =>
      updateSquad(id, {
        name: data.squadName,
        description: data.squadDescription ?? "",
        stack: data.techStack.join(", "),
        squad_lead_id: data.squadLeader ? parseInt(data.squadLeader, 10) : null,
        team_composition: data.roles,
        member_ids: data.members,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["squads"] });
      toast.success("Squad updated");
      router.push("/squads");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    },
  });

  const form = useForm<SquadFormValues>({
    resolver: zodResolver(squadSchema),
    defaultValues: {
      squadName: initialValues?.squadName ?? "",
      squadDescription: initialValues?.squadDescription ?? "",
      techStack: initialValues?.techStack ?? [],
      squadLeader: initialValues?.squadLeader ?? "",
      roles: initialValues?.roles ?? {},
      members: initialValues?.members ?? [],
    },
  });

  useEffect(() => {
    if (initialValues?.squadId != null) {
      form.reset({
        squadName: initialValues.squadName ?? "",
        squadDescription: initialValues.squadDescription ?? "",
        techStack: initialValues.techStack ?? [],
        squadLeader: initialValues.squadLeader ?? "",
        roles: initialValues.roles ?? {},
        members: initialValues.members ?? [],
      });
    }
  }, [
    initialValues?.squadId,
    initialValues?.squadName,
    initialValues?.squadDescription,
    initialValues?.techStack,
    initialValues?.squadLeader,
    initialValues?.roles,
    initialValues?.members,
    form,
  ]);

  const onSubmit = (data: SquadFormValues) => {
    if (squadId != null) {
      updateMutation.mutate({ id: squadId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
  };
}

export async function fetchSquadForEdit(
  squadId: string
): Promise<Partial<SquadFormValues> & { squadId?: number }> {
  const id = parseInt(squadId, 10);
  if (Number.isNaN(id)) {
    return {};
  }
  const squad = await getSquad(id);
  const stack = squad.stack
    ? squad.stack.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  return {
    squadId: squad.id,
    squadName: squad.name,
    squadDescription: squad.description ?? "",
    techStack: stack,
    squadLeader: squad.squad_lead?.id != null ? String(squad.squad_lead.id) : "",
    roles: squad.team_composition ?? {},
    members: squad.members?.map(m => ({
      app_user_id: m.app_user.id,
      role_in_squad: m.role_in_squad
    })) ?? [],
  };
}
