"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEmployeeDetail } from "@/services/employee";
import { listFeedback } from "@/services/feedback";
import {
  ProfileHeader,
  StatsOverview,
  BadgesCard,
  TaskAnalyticsCard,
  PerformanceCard,
  TeamContextCard,
} from "@/components/profile";
import type { EmployeeProfile } from "@/types/employee";
import type { EmployeeDetailResponse } from "@/services/employee";
import type { FeedbackResponse } from "@/services/feedback";
import { FeedbackHistoryCard } from "@/components/profile/FeedbackHistoryCard";

function mapToEmployeeProfile(
  data: EmployeeDetailResponse,
  feedbacks: FeedbackResponse[]
): EmployeeProfile {
  const totalFeedback = feedbacks.length;
  const avgRating = data.average_rating ?? 0;

  // Build feedback distribution (1-5 scale based on rating / 5 → stars)
  const distribution: Record<string, number> = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
  feedbacks.forEach((f) => {
    const stars = Math.min(5, Math.max(1, Math.round(f.rating / 5)));
    distribution[String(stars)] = (distribution[String(stars)] || 0) + 1;
  });

  return {
    id: String(data.id),
    fullName: `${data.first_name} ${data.last_name}`.trim() || data.email,
    role: data.role ?? "—",
    avatarUrl: data.profile?.avatar_url ?? undefined,
    department: "Engineering",
    joinDate: data.created_at,
    status: "active",
    email: data.email,
    bio: data.profile?.bio,
    socialLinks: {
      github: data.profile?.github ?? undefined,
      linkedin: data.profile?.linkedin ?? undefined,
      twitter: data.profile?.twitter ?? undefined,
      extra: data.profile?.social_links ?? [],
    },
    gamification: {
      levelNumber: data.xp_info?.level ?? 0,
      currentXp: data.xp_info?.total_xp ?? 0,
      xpToNextLevel: data.xp_info ? getXpToNextLevel(data.xp_info.total_xp) : 100,
      badges: [],
    },
    taskAnalytics: {
      totalTasksCompleted: data.completed_task_count ?? 0,
      tasksInProgress: data.in_progress_task_count ?? 0,
      tasksToDo: data.to_do_task_count ?? 0,
      tasksOnHold: data.on_hold_task_count ?? 0,
      completionRate:
        (data.task_count ?? 0) > 0
          ? Math.round(((data.completed_task_count ?? 0) / (data.task_count ?? 1)) * 100)
          : 0,
    },
    performance: {
      overallRating: avgRating,
      totalFeedbackCount: totalFeedback,
      fiveStarFeedbackCount: distribution["5"],
      feedbackDistribution: distribution,
    },
    team: {},
  };
}

function getXpToNextLevel(totalXp: number): number {
  const thresholds = [0, 100, 500, 1500, 3500, 7000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalXp >= thresholds[i]) {
      const next = thresholds[i + 1] ?? thresholds[i] + 3500;
      return next - totalXp;
    }
  }
  return 100;
}

export default function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = use(params);
  const numericId = parseInt(employeeId, 10);

  const { data, isLoading, error } = useQuery({
    queryKey: ["employeeDetail", numericId],
    queryFn: () => getEmployeeDetail(numericId),
    enabled: !isNaN(numericId),
    staleTime: 1000 * 60 * 2,
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ["feedbacks", numericId],
    queryFn: () => listFeedback(numericId),
    enabled: !isNaN(numericId),
    staleTime: 1000 * 60 * 2,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading profile…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">Failed to load profile.</div>
      </div>
    );
  }

  const employee = mapToEmployeeProfile(data, feedbacks);

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto px-4 py-8">
        <ProfileHeader employee={employee} />
        <StatsOverview employee={employee} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
          <div className="lg:col-span-2">
            <TaskAnalyticsCard analytics={employee.taskAnalytics} />
          </div>

          <div>
            <TeamContextCard team={employee.team} />
          </div>

          <div className="lg:col-span-1">
            <PerformanceCard performance={employee.performance} />
          </div>

          <div className="lg:col-span-2">
            <BadgesCard badges={employee.gamification.badges} />
          </div>

          <div className="lg:col-span-3">
            <FeedbackHistoryCard employeeId={numericId} />
          </div>
        </div>
      </main>
    </div>
  );
}
