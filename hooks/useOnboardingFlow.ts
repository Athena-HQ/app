import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  onboardingService,
  type BuddyProfile,
  type ChecklistPreview,
  type OnboardingProfilePayload,
} from "@/services/onboarding";
import {
  onboardingProfileSchema,
  type OnboardingProfileForm,
} from "@/lib/validations/onboarding";

type OnboardingStep = "welcome" | "profile-basic" | "checklist";

type FieldDefinition = {
  key: keyof OnboardingProfileForm;
  label: string;
  placeholder: string;
  type?: string;
};

const sharedFields: FieldDefinition[] = [
  {
    key: "preferredName",
    label: "Preferred name",
    placeholder: "Optional nickname",
  },
  { key: "timezone", label: "Timezone", placeholder: "UTC-5" },
  {
    key: "bio",
    label: "Professional snapshot",
    placeholder: "Tell the team about your focus and goals",
    type: "textarea",
  },
];

type UseOnboardingFlowArgs = {
  token?: string;
};

function flattenErrors(
  errors: Record<string, unknown>,
  prefix = ""
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(errors)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && "message" in value) {
      const msg = (value as { message?: string }).message;
      if (typeof msg === "string") result[path] = msg;
    } else if (value && typeof value === "object") {
      Object.assign(
        result,
        flattenErrors(value as Record<string, unknown>, path)
      );
    }
  }
  return result;
}

export const useOnboardingFlow = ({ token }: UseOnboardingFlowArgs) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [checklist, setChecklist] = useState<ChecklistPreview | null>(null);
  const [buddy, setBuddy] = useState<BuddyProfile | null>(null);

  const inviteQuery = useQuery({
    queryKey: ["onboarding-invite", token],
    queryFn: () => onboardingService.verifyInvite(token),
    enabled: Boolean(token),
    staleTime: Infinity,
  });

  const getDefaultValues = useCallback((): OnboardingProfileForm => {
    const fullName = inviteQuery.data?.invite.fullName || "";
    const nameParts = fullName.split(" ");
    return {
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      preferredName: "",
      timezone: "",
      startDate: "",
      bio: "",
      roleDetails: {},
      socialMedia: {},
    };
  }, [inviteQuery.data?.invite.fullName]);

  const form = useForm<OnboardingProfileForm>({
    resolver: zodResolver(onboardingProfileSchema) as never,
    defaultValues: getDefaultValues(),
    mode: "onTouched",
  });

  useEffect(() => {
    if (inviteQuery.data?.invite.fullName) {
      form.reset(getDefaultValues());
    }
  }, [inviteQuery.data?.invite.fullName, form, getDefaultValues]);

  const values = form.watch();
  const formErrors = form.formState.errors;
  const errors = flattenErrors(
    formErrors as Record<string, unknown>
  ) as Record<string, string>;

  const initialChecklist = inviteQuery.data?.checklist ?? null;
  const initialBuddy = inviteQuery.data?.buddy ?? null;

  const mutation = useMutation({
    mutationFn: onboardingService.submitProfile,
    onSuccess: (data) => {
      setChecklist(data.checklist);
      setBuddy(data.buddy);
      setCurrentStep("checklist");
    },
  });

  const updateField = (key: keyof OnboardingProfileForm, value: string) => {
    form.setValue(key, value);
  };

  const updateSocialMediaField = (key: string, value: string) => {
    form.setValue("socialMedia", {
      ...(values.socialMedia ?? {}),
      [key]: value,
    });
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!token) {
      form.setError("root", { message: "Missing invitation token" });
      return;
    }
    try {
      await mutation.mutateAsync({
        token,
        profile: data as unknown as OnboardingProfilePayload,
      });
    } catch {
      // mutation error handled by mutation
    }
  });

  const startProfile = () => {
    setCurrentStep("profile-basic");
  };

  return {
    inviteQuery,
    sharedFields,
    values,
    errors,
    currentStep,
    isSubmitting: mutation.isPending,
    submitError:
      mutation.error instanceof Error ? mutation.error.message : null,
    checklist,
    initialChecklist,
    buddy,
    initialBuddy,
    startProfile,
    updateField,
    updateSocialMediaField,
    handleSubmit,
  };
};
