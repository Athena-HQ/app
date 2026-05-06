"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { taskService, type TaskResponse } from "@/services/task";
import { feedbackService, type FeedbackResponse } from "@/services/feedback";
import { FeedbackForm } from "@/components/feedback/feedback_form";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TaskFeedbackPage({ params }: { params: Promise<{ taskId: string }> }) {
  const router = useRouter();
  const { taskId } = use(params);
  
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [existingFeedbacks, setExistingFeedbacks] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const taskData = await taskService.getTaskById(taskId);
        if (!taskData) {
          setError("Task not found");
          setLoading(false);
          return;
        }
        setTask(taskData);

        const feedbacksData = await feedbackService.listFeedbackForTask(parseInt(taskId, 10));
        setExistingFeedbacks(feedbacksData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load task details");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [taskId]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <div className="text-red-500">{error || "Task not found"}</div>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Leave Feedback</h1>
          <p className="text-muted-foreground text-sm">
            Task: {task.title}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border p-6">
        <FeedbackForm task={task} existingFeedbacks={existingFeedbacks} />
      </div>
    </div>
  );
}
