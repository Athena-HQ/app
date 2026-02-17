"use client";

import { motion } from "framer-motion";
import { TaskDetails } from "@/components/task/task_details";
import { useTask } from "@/hooks/useTasks";
import { fadeInVariants } from "@/lib/animations-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import type { TaskResponse } from "@/services/task";

type TaskDetailPageClientProps = {
  taskId: string;
  initialTask: TaskResponse | null;
};

export function TaskDetailPageClient({
  taskId,
  initialTask,
}: TaskDetailPageClientProps) {
  const { data: task, isLoading, error } = useTask(taskId, {
    initialData: initialTask,
  });

  if (isLoading) {
    return (
      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6 w-full"
      >
        <Card className="p-6">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      </motion.div>
    );
  }

  if (error || !task) {
    return (
      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6 w-full"
      >
        <Card className="p-6">
          <p className="text-destructive">Task not found</p>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6 w-full"
    >
      <TaskDetails task={task} />
    </motion.div>
  );
}
