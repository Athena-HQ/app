"use client";

import { motion } from "framer-motion";
import { TaskForm } from "@/components/task/task_form";
import { useTask } from "@/hooks/useTasks";
import { fadeInVariants } from "@/lib/animations-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { Frame, FramePanel } from "@/components/ui/frame";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import type { TaskResponse } from "@/services/task";

type TaskEditPageClientProps = {
  taskId: string;
  initialTask: TaskResponse | null;
};

export function TaskEditPageClient({
  taskId,
  initialTask,
}: TaskEditPageClientProps) {
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Frame>
          <FramePanel>
            <Skeleton className="h-96 w-full" />
          </FramePanel>
        </Frame>
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/tasks">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to tasks</span>
            </Link>
          </Button>
        </div>
        <Frame>
          <FramePanel>
            <p className="text-destructive">Task not found</p>
          </FramePanel>
        </Frame>
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/tasks/${taskId}`}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to task details</span>
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Edit className="h-6 w-6 text-muted-foreground" />
            <div>
              <h1 className="text-3xl font-bold">Edit Task</h1>
              <p className="text-muted-foreground mt-1">
                Update task details and information
              </p>
            </div>
          </div>
        </div>
      </div>

      <TaskForm taskId={taskId} />
    </motion.div>
  );
}
