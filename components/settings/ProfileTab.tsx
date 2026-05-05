"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Globe, User, Award, Star, Trophy, Clock } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getMyXp, getMyBadges } from "@/services/gamification";
import { getDashboardStats } from "@/services/dashboard";
import { updateEmployeeProfile, updateSocialLinks } from "@/services/settings";
import { updateMyProfile, type ProfileUpdateRequest } from "@/services/employee";
import type { CurrentAppUser } from "@/hooks/useCurrentAppUser";
import { SocialLinksEditor, type SocialLink } from "./SocialLinksEditor";
import { SaveBar } from "./SaveBar";

// ─── Schema ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  bio: z.string().max(280, "Bio must be 280 characters or less").optional(),
  timezone: z.string(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  description,
  actions,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          <Icon size={18} />
        </div>
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold leading-tight">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions}
    </div>
  );
}

function FieldRow({
  label,
  hint,
  required,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs uppercase tracking-wide text-muted-foreground font-medium"
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground leading-snug">{hint}</p>}
    </div>
  );
}

function StatPill({
  label,
  value,
  subtext,
  icon: Icon,
  tint,
}: {
  label: string;
  value: number | string;
  subtext: string;
  icon: React.ElementType;
  tint: "blue" | "amber" | "purple" | "green";
}) {
  const tints: Record<string, string> = {
    blue: "text-blue-500 bg-blue-500/10",
    amber: "text-amber-500 bg-amber-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    green: "text-green-500 bg-green-500/10",
  };
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-4 flex items-center gap-3">
      <div className={cn("p-2.5 rounded-xl", tints[tint])}>
        <Icon size={20} />
      </div>
      <div className="flex flex-col min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          {label}
        </p>
        <p className="text-2xl font-bold leading-tight">{value}</p>
        <p className="text-[11px] text-muted-foreground truncate">{subtext}</p>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProfileTabProps {
  appUser: CurrentAppUser;
}

function buildInitialSocials(raw: CurrentAppUser["raw"]): SocialLink[] {
  return [
    {
      id: "preset-github",
      platform: "GitHub",
      value: raw.profile?.github ?? "",
      visible: true,
      preset: true,
    },
    {
      id: "preset-linkedin",
      platform: "LinkedIn",
      value: raw.profile?.linkedin ?? "",
      visible: true,
      preset: true,
    },
    {
      id: "preset-website",
      platform: "Website",
      value: "",
      visible: true,
      preset: true,
    },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfileTab({ appUser }: ProfileTabProps) {
  const rawProfile = appUser.raw.profile;

  const [socials, setSocials] = useState<SocialLink[]>(() =>
    buildInitialSocials(appUser.raw)
  );
  const [socialsDirty, setSocialsDirty] = useState(false);

  const { data: xpData } = useQuery({
    queryKey: ["myXp"],
    queryFn: getMyXp,
    staleTime: 1000 * 60 * 5,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ["myBadges"],
    queryFn: getMyBadges,
    staleTime: 1000 * 60 * 5,
  });

  const { data: taskStats } = useQuery({
    queryKey: ["dashboardStats", "personal"],
    queryFn: () => getDashboardStats("personal"),
    staleTime: 1000 * 60 * 5,
  });

  const { mutateAsync: saveFullProfile } = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const payload: ProfileUpdateRequest = {
        first_name: values.first_name,
        last_name: values.last_name,
        bio: values.bio,
      };

      for (const link of socials) {
        const p = link.platform.toLowerCase();
        // If visible is false, we clear the link by sending an empty string
        const val = link.visible ? link.value : "";
        if (p === "github") payload.github = val;
        else if (p === "linkedin") payload.linkedin = val;
        else if (p === "twitter") payload.twitter = val;
      }

      return updateMyProfile(payload);
    },
  });

  const initials = (
    (appUser.raw.first_name?.[0] ?? "") + (appUser.raw.last_name?.[0] ?? "")
  )
    .toUpperCase()
    .trim() || appUser.email[0].toUpperCase();

  // TODO: backend endpoint needed — link XP level/progress from /xp/my_xp/ when available
  const level = xpData?.level ?? 0;
  const totalXp = xpData?.total_xp ?? 0;
  const xpForNextLevel = totalXp > 0 ? (Math.floor(totalXp / 1000) + 1) * 1000 : 1000;
  const xpToNext = Math.max(0, xpForNextLevel - totalXp);
  const xpPct = Math.min(100, ((xpForNextLevel - xpToNext) / xpForNextLevel) * 100);

  const tasksCompleted = taskStats ? taskStats.done + taskStats.under_review : 0;
  const tasksInProgress = taskStats?.in_progress ?? 0;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: appUser.raw.first_name ?? "",
      last_name: appUser.raw.last_name ?? "",
      bio: rawProfile?.bio ?? "",
      timezone: "America/New_York",
    },
  });

  const bioValue = watch("bio") ?? "";
  const combinedDirty = isDirty || socialsDirty;

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await saveFullProfile(values);
      toast.success("Profile saved");
      reset(values);
      setSocialsDirty(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile. Make sure URLs are valid.");
    }
  };

  const handleDiscard = () => {
    reset();
    setSocials(buildInitialSocials(appUser.raw));
    setSocialsDirty(false);
  };

  const stats = [
    {
      label: "Tasks completed",
      value: tasksCompleted,
      subtext: "Done + under review",
      icon: CheckCircle2,
      tint: "blue" as const,
    },
    {
      label: "In progress",
      value: tasksInProgress,
      subtext: "Active this week",
      icon: Clock,
      tint: "green" as const,
    },
    {
      label: "Badges earned",
      value: badges.length,
      subtext: "Unlocked achievements",
      icon: Trophy,
      tint: "amber" as const,
    },
    {
      label: "Total XP",
      value: totalXp,
      subtext: `Level ${level}`,
      icon: Star,
      tint: "purple" as const,
    },
    // TODO: backend endpoint needed — overall performance rating from task feedback endpoint
    // Once /feedback/my-rating/ (or equivalent) is available, add a 5th StatPill here
    // with the user's average rating and review count.
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          asChild 
          size="sm" 
          className="rounded-full border-green-600 text-green-600 hover:bg-green-600/10 hover:text-green-700"
        >
          <Link href={`/employees/${appUser.id}`}>
            See public view
          </Link>
        </Button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Identity */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar + XP bar */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="relative">
                <Avatar className="w-28 h-28 border-2 border-border/50 shadow-md">
                  <AvatarFallback className="text-3xl font-serif">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <Badge className="px-2 py-0.5 text-[10px] font-bold border-amber-200 bg-amber-100 text-amber-800">
                    Lvl {level}
                  </Badge>
                </div>
              </div>
              <div className="w-28 space-y-1 mt-2">
                <div className="flex justify-between text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  <span>XP</span>
                  <span>{totalXp}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                    style={{ width: `${xpPct}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground text-right">
                  {xpToNext} to {level + 1}
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1 w-full flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FieldRow label="First name" required htmlFor="p-first-name">
                  <Input
                    id="p-first-name"
                    {...register("first_name")}
                    className={cn(errors.first_name && "border-destructive")}
                  />
                  {errors.first_name && (
                    <p className="text-[11px] text-destructive">
                      {errors.first_name.message}
                    </p>
                  )}
                </FieldRow>

                <FieldRow label="Last name" required htmlFor="p-last-name">
                  <Input
                    id="p-last-name"
                    {...register("last_name")}
                    className={cn(errors.last_name && "border-destructive")}
                  />
                  {errors.last_name && (
                    <p className="text-[11px] text-destructive">
                      {errors.last_name.message}
                    </p>
                  )}
                </FieldRow>

                <FieldRow label="Email" hint="Contact your admin to change your email.">
                  <Input
                    type="email"
                    value={appUser.email}
                    readOnly
                    className="bg-muted/40 text-muted-foreground cursor-not-allowed"
                  />
                </FieldRow>

                <FieldRow label="Role" hint="Role is managed by your company admin.">
                  <Input
                    value={appUser.role ?? "—"}
                    readOnly
                    className="bg-muted/40 text-muted-foreground cursor-not-allowed capitalize"
                  />
                </FieldRow>

                <div className="sm:col-span-2">
                  <FieldRow
                    label="Bio"
                    hint={`${bioValue.length}/280 — rendered on your employee page.`}
                  >
                    <textarea
                      {...register("bio")}
                      rows={3}
                      maxLength={280}
                      className="placeholder:text-muted-foreground border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none resize-none"
                    />
                  </FieldRow>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity stats */}
      <div>
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold leading-tight">Your activity</h2>
            <p className="text-xs text-muted-foreground">
              Rolls up from tasks across all your squads.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <StatPill key={i} {...s} />
          ))}
        </div>
      </div>

      {/* Badges */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={Award}
            title="Badges"
            description="Unlock achievements as you ship work. Earned badges appear on your public profile."
            actions={
              <Badge variant="secondary" className="text-[11px]">
                {badges.length} earned
              </Badge>
            }
          />
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No badges yet — keep shipping!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {badges.map((eb) => (
                <div
                  key={eb.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-muted/40 border-border hover:bg-muted/60 transition-colors"
                >
                  <div className="p-2 rounded-lg shrink-0 bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                    <Award size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm">{eb.badge.name}</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {eb.badge.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Earned {new Date(eb.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social links */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={Globe}
            title="Social links"
            description="All fields are optional. Type a platform name and we'll auto-match its icon; unknown platforms use a generic link icon."
            actions={
              <Badge variant="secondary" className="text-[11px]">
                {socials.filter((s) => s.value && s.visible).length} visible
              </Badge>
            }
          />
        </CardHeader>
        <CardContent>
          <SocialLinksEditor
            links={socials}
            onChange={(next) => {
              setSocials(next);
              setSocialsDirty(true);
            }}
          />
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <SectionHeader
            icon={User}
            title="Account"
            description="Personal preferences."
          />
        </CardHeader>
        <CardContent>
          <FieldRow label="Timezone">
            <select
              {...register("timezone")}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
            >
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Berlin">Europe/Berlin</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
            </select>
          </FieldRow>
        </CardContent>
      </Card>

      <SaveBar
        isDirty={combinedDirty}
        isSubmitting={isSubmitting}
        onDiscard={handleDiscard}
      />
      </form>
    </div>
  );
}
