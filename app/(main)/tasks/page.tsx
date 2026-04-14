"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TaskTable } from "@/components/task/task_table";
import { TaskFiltersComponent } from "@/components/task/task_filters";
import { useTasks } from "@/hooks/useTasks";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { getMySquadTasks, type TaskFilters, type TaskListResponse } from "@/services/task";
import { fadeInVariants } from "@/lib/animations-settings";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import Link from "next/link";
import { PlusIcon, Users } from "lucide-react";

export default function TasksPage() {
  const { appUser } = useCurrentAppUser();
  const currentUserId = appUser?.id;
  const [view, setView] = useState<
    "assigned_to_me" | "assigned_by_me" | "all" | "needs_review" | "my_squad_tasks"
  >("all");
  const [filters, setFilters] = useState<TaskFilters>({});

  const taskFilters: TaskFilters = {
    ...filters,
    ...(view === "assigned_to_me" && currentUserId
      ? { assigned_to: currentUserId }
      : {}),
    ...(view === "assigned_by_me" && currentUserId
      ? { assigned_by: currentUserId }
      : {}),
    ...(view === "needs_review"
      ? { status: "completed", ...(currentUserId ? { assigned_by: currentUserId } : {}) }
      : {}),
  };

  // Regular task list (used for all views except my_squad_tasks)
  const { data: tasks = [], isLoading } = useTasks(
    view !== "my_squad_tasks" ? taskFilters : {}
  );

  // Dedicated squad tasks query
  const { data: squadTasks = [], isLoading: isSquadTasksLoading } = useQuery({
    queryKey: queryKeys.tasks.mySquadTasks,
    queryFn: () => getMySquadTasks(),
    enabled: view === "my_squad_tasks",
  });

  const { data: needsReviewTasks = [] } = useTasks({
    status: "completed",
    assigned_by: currentUserId,
  });

  const needsReviewCount = needsReviewTasks.length;
  const needsReviewIds = new Set(
    needsReviewTasks.map((t) => String(t.id))
  );

  const displayTasks: TaskListResponse[] = view === "my_squad_tasks" ? squadTasks : tasks;
  const displayLoading = view === "my_squad_tasks" ? isSquadTasksLoading : isLoading;

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6 w-full"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tasks</h1>
          <p className="text-muted-foreground">Manage and track your tasks</p>
        </div>
        <Button asChild>
          <Link href="/tasks/create">
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Task
          </Link>
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={view === "all" ? "default" : "secondary"}
          onClick={() => setView("all")}
        >
          All Tasks
        </Button>
        <Button
          variant={view === "assigned_to_me" ? "default" : "secondary"}
          onClick={() => setView("assigned_to_me")}
        >
          Assigned to Me
        </Button>
        <Button
          variant={view === "assigned_by_me" ? "default" : "secondary"}
          onClick={() => setView("assigned_by_me")}
        >
          Assigned by Me
        </Button>
        <Button
          variant={view === "my_squad_tasks" ? "default" : "secondary"}
          onClick={() => setView("my_squad_tasks")}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          My Squad Tasks
        </Button>
        {needsReviewCount > 0 && (
          <Button
            variant={view === "needs_review" ? "default" : "secondary"}
            onClick={() => setView("needs_review")}
            className="relative"
          >
            Needs Review
            <span className="ml-2 px-2 py-0.5 text-xs bg-warning text-warning-foreground rounded-full">
              {needsReviewCount}
            </span>
          </Button>
        )}
      </div>

      {view !== "my_squad_tasks" && (
        <TaskFiltersComponent filters={filters} onFiltersChange={setFilters} />
      )}

      <TaskTable
        tasks={displayTasks}
        isLoading={displayLoading}
        needsReviewIds={needsReviewIds}
      />
    </motion.div>
  );
}
