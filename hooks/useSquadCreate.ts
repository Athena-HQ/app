import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
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
        project_name: data.squadName,
        leader_id: data.squadLeader ? parseInt(data.squadLeader, 10) : null,
        is_active: true,
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
        project_name: data.squadName,
        leader_id: data.squadLeader ? parseInt(data.squadLeader, 10) : null,
        is_active: true,
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

  const onSubmit = async ({
    value,
    squadId,
  }: {
    value: SquadFormValues;
    squadId?: number;
  }) => {
    if (squadId != null) {
      await updateMutation.mutateAsync({ id: squadId, data: value });
    } else {
      await createMutation.mutateAsync(value);
    }
  };

  const form = useForm({
    defaultValues: {
      squadName: initialValues?.squadName ?? "",
      squadDescription: initialValues?.squadDescription ?? "",
      techStack: initialValues?.techStack ?? ([] as string[]),
      squadLeader: initialValues?.squadLeader ?? "",
      roles: initialValues?.roles ?? ({} as Record<string, number>),
    },
    onSubmit: async ({ value }) => {
      await onSubmit({ value, squadId });
    },
  });

  return {
    form,
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
    squadLeader: squad.leader?.id != null ? String(squad.leader.id) : "",
    roles: {},
  };
}
