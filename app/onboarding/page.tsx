"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOnboardingFlow } from "@/hooks/useOnboardingFlow";
import { useOnboardingChecklist } from "@/hooks/useOnboardingChecklist";
import { useAuth } from "@/contexts/auth-context";
import { WelcomeScreen } from "@/components/onboarding/welcome-screen";
import { ChecklistBoard } from "@/components/onboarding/checklist-board";
import { FieldControl } from "@/components/onboarding/field-control";
import { TwoSideLayout } from "@/components/onboarding/two-side-layout";
import { OnboardingSidePanel } from "@/components/onboarding/onboarding-side-panel";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || searchParams.get("key") || "";
  const { user, isLoading: authLoading } = useAuth();
  const {
    checklist: apiChecklist,
    rawChecklist,
    isLoading: checklistLoading,
    isError: checklistError,
    completeItem,
    isCompleting,
  } = useOnboardingChecklist();

  useEffect(() => {
    if (token) {
      router.replace(`/accept-invitation?key=${encodeURIComponent(token)}`);
    }
  }, [token, router]);

  const {
    inviteQuery,
    sharedFields,
    values,
    errors,
    isSubmitting,
    submitError,
    currentStep,
    checklist,
    initialChecklist,
    buddy,
    initialBuddy,
    startProfile,
    updateField,
    updateSocialMediaField,
    handleSubmit,
  } = useOnboardingFlow({ token: token || undefined });

  if (token) {
    return (
      <CenteredState
        title="Redirecting..."
        description="Taking you to accept your invitation."
      />
    );
  }

  if (!user && !authLoading) {
    return (
      <CenteredState
        title="Log in to view onboarding"
        description="Sign in to see and complete your onboarding checklist."
        actionLabel="Log in"
        actionHref="/login"
      />
    );
  }

  if (user && !inviteQuery.data && !apiChecklist && !checklistLoading) {
    if (checklistError) {
      return (
        <CenteredState
          title="No checklist yet"
          description="Complete your account setup or ask your admin to assign an onboarding checklist."
          actionLabel="Go to dashboard"
          actionHref="/dashboard"
        />
      );
    }
    if (!checklistLoading) {
      return (
        <CenteredState
          title="No checklist yet"
          description="Your onboarding checklist will appear here once assigned."
          actionLabel="Go to dashboard"
          actionHref="/dashboard"
        />
      );
    }
  }

  if (user && apiChecklist) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <div className="w-full max-w-4xl flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-start w-full">
            <p className="text-xs font-medium text-muted-foreground">
              Your onboarding
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Checklist
            </h1>
          </div>
          <ChecklistBoard
            checklist={apiChecklist}
            onComplete={
              rawChecklist
                ? (stepId) => {
                    const item = rawChecklist.items.find(
                      (i) => String(i.id) === stepId
                    );
                    if (item && !item.is_completed) {
                      completeItem(item.id);
                    }
                  }
                : undefined
            }
            isCompleting={isCompleting}
          />
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (authLoading || (user && checklistLoading)) {
    return (
      <CenteredState
        title="Loading"
        description="Loading your onboarding..."
      />
    );
  }

  if (inviteQuery.isLoading) {
    return (
      <CenteredState
        title="Loading invite"
        description="Preparing your onboarding flow..."
      />
    );
  }

  if (inviteQuery.isError || !inviteQuery.data) {
    const message =
      inviteQuery.error instanceof Error
        ? inviteQuery.error.message
        : "Unable to load invitation";
    return (
      <CenteredState
        title="Invite unavailable"
        description={message}
        actionLabel="Back to login"
        actionHref="/login"
      />
    );
  }

  const invite = inviteQuery.data.invite;
  const activeChecklist = checklist ?? initialChecklist;
  const activeBuddy = buddy ?? initialBuddy;

  if (currentStep === "welcome") {
    return (
      <TwoSideLayout
        leftPanel={
          <OnboardingSidePanel
            step="welcome"
            invite={invite}
            buddy={activeBuddy}
          />
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key="welcome"
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <WelcomeScreen
              invite={invite}
              buddy={activeBuddy}
              onStart={startProfile}
            />
          </motion.div>
        </AnimatePresence>
      </TwoSideLayout>
    );
  }

  if (currentStep === "checklist" && activeChecklist) {
    return (
      <TwoSideLayout
        leftPanel={
          <OnboardingSidePanel
            step="checklist"
            invite={invite}
            buddy={activeBuddy}
            checklist={activeChecklist}
          />
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key="checklist"
            className="w-full max-w-4xl *:mx-auto flex flex-col gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="flex flex-col gap-1 text-start w-full *:mx-auto">
              <p className="text-xs font-medium text-muted-foreground">
                You are officially onboard
              </p>
              <h1 className="text-2xl font-semibold tracking-tight ">
                Meet your buddy and first wins
              </h1>
            </div>
            <ChecklistBoard checklist={activeChecklist} />
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </motion.div>
        </AnimatePresence>
      </TwoSideLayout>
    );
  }

  if (currentStep === "profile-basic") {
    return (
      <TwoSideLayout
        leftPanel={
          <OnboardingSidePanel
            step="profile-basic"
            invite={invite}
            buddy={activeBuddy}
            checklist={initialChecklist}
          />
        }
      >
        <AnimatePresence mode="wait">
          <motion.div
            key="profile-basic"
            className="w-full max-w-2xl flex flex-col gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Welcome to {invite.companyName}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                Complete your profile
              </h1>
            </div>

            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleSubmit();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {sharedFields.map((field) => (
                  <FieldControl
                    key={field.key as string}
                    label={field.label}
                    error={errors[field.key as string]}
                    className={cn(
                      "col-span-1",
                      field.type === "textarea" && "col-span-2"
                    )}
                  >
                    {field.type === "textarea" ? (
                      <Textarea
                        value={values[field.key] as string}
                        onChange={(event) =>
                          updateField(field.key, event.target.value)
                        }
                        rows={3}
                        className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                        aria-invalid={Boolean(errors[field.key as string])}
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <Input
                        type={field.type ?? "text"}
                        value={values[field.key] as string}
                        onChange={(event) =>
                          updateField(field.key, event.target.value)
                        }
                        aria-invalid={Boolean(errors[field.key as string])}
                        placeholder={field.placeholder}
                      />
                    )}
                  </FieldControl>
                ))}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Social media links (optional)
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(() => {
                    const socialMedia = values.socialMedia ?? {};
                    return (
                      <>
                        <FieldControl
                          label="LinkedIn"
                          error={errors["socialMedia.linkedin"]}
                        >
                          <Input
                            type="url"
                            value={(socialMedia.linkedin as string) ?? ""}
                            onChange={(event) =>
                              updateSocialMediaField(
                                "linkedin",
                                event.target.value
                              )
                            }
                            aria-invalid={Boolean(
                              errors["socialMedia.linkedin"]
                            )}
                            placeholder="https://linkedin.com/in/yourprofile"
                          />
                        </FieldControl>
                        <FieldControl
                          label="Twitter / X"
                          error={errors["socialMedia.twitter"]}
                        >
                          <Input
                            type="url"
                            value={(socialMedia.twitter as string) ?? ""}
                            onChange={(event) =>
                              updateSocialMediaField(
                                "twitter",
                                event.target.value
                              )
                            }
                            aria-invalid={Boolean(
                              errors["socialMedia.twitter"]
                            )}
                            placeholder="https://twitter.com/yourhandle"
                          />
                        </FieldControl>
                        <FieldControl
                          label="GitHub"
                          error={errors["socialMedia.github"]}
                        >
                          <Input
                            type="url"
                            value={(socialMedia.github as string) ?? ""}
                            onChange={(event) =>
                              updateSocialMediaField(
                                "github",
                                event.target.value
                              )
                            }
                            aria-invalid={Boolean(errors["socialMedia.github"])}
                            placeholder="https://github.com/yourusername"
                          />
                        </FieldControl>
                        <FieldControl
                          label="Website"
                          error={errors["socialMedia.website"]}
                        >
                          <Input
                            type="url"
                            value={(socialMedia.website as string) ?? ""}
                            onChange={(event) =>
                              updateSocialMediaField(
                                "website",
                                event.target.value
                              )
                            }
                            aria-invalid={Boolean(
                              errors["socialMedia.website"]
                            )}
                            placeholder="https://yourwebsite.com"
                          />
                        </FieldControl>
                      </>
                    );
                  })()}
                </div>
              </div>

              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : "Submit profile"}
                </Button>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </TwoSideLayout>
    );
  }

  return null;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-lg text-center flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">Loading...</h1>
            <p className="text-sm text-muted-foreground">Preparing your onboarding flow...</p>
          </div>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}

type CenteredStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

function CenteredState({
  title,
  description,
  actionLabel,
  actionHref,
}: CenteredStateProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-lg text-center flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {actionLabel && actionHref && (
          <Button asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
