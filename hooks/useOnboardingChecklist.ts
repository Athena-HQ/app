import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyChecklist,
  completeChecklistItem,
  checklistResponseToPreview,
  type OnboardingChecklistResponse,
  type ChecklistPreview,
  type BuddyProfile,
  buddyResponseToProfile,
} from "@/services/onboarding";

export function useOnboardingChecklist() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["onboarding", "my_checklist"],
    queryFn: getMyChecklist,
    staleTime: 1000 * 60,
  });

  const completeMutation = useMutation({
    mutationFn: (itemId: number) => completeChecklistItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding", "my_checklist"] });
    },
  });

  const checklist: ChecklistPreview | null =
    query.data != null ? checklistResponseToPreview(query.data) : null;
  const buddy: BuddyProfile | null =
    query.data?.buddy != null
      ? buddyResponseToProfile(query.data.buddy)
      : null;
  const rawChecklist: OnboardingChecklistResponse | null = query.data ?? null;

  return {
    checklist,
    buddy,
    rawChecklist,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    completeItem: completeMutation.mutate,
    isCompleting: completeMutation.isPending,
  };
}
