"use client";

import { motion } from "framer-motion";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { fadeInVariants } from "@/lib/animations-settings";
import { HeroStatCard } from "@/components/dashboard/hero_stat_card";
import { TaskStatCards } from "@/components/dashboard/task_stat_card";
import { TaskCompletionGraph } from "@/components/dashboard/task_completion_graph";
import { useAssignableUsers } from "@/hooks/useCurrentAppUser";

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { assignableUsers } = useAssignableUsers();
  const isManager = assignableUsers.length > 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-2 w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        <div className="lg:col-span-4 h-full">
          <HeroStatCard
            xp={stats.gamification.xp}
            level={stats.gamification.level}
            completionRate={stats.completionRate}
            averageCompletionTime={stats.averageCompletionTime}
            currentStreak={stats.currentStreak}
            needsReviewCount={stats.needsReviewTasks.length}
            isManager={isManager}
          />
        </div>
        <div className="lg:col-span-8 h-full">
          <TaskCompletionGraph
            threeMonths={stats.taskCompletionData.threeMonths}
            sixMonths={stats.taskCompletionData.sixMonths}
            twelveMonths={stats.taskCompletionData.twelveMonths}
          />
        </div>
      </div>

      <div className="flex  w-full *:w-full gap-2">
        <TaskStatCards
          inProgress={stats.widgetCounts.inProgress}
          todo={stats.widgetCounts.todo}
          done={stats.widgetCounts.done}
          onHold={stats.widgetCounts.onHold}
        />
      </div>
    </motion.div>
  );
}
