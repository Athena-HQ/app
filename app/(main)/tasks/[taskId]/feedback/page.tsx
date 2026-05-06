"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { taskService, type TaskResponse } from "@/services/task";
import { feedbackService, type FeedbackResponse } from "@/services/feedback";
import { FeedbackForm } from "@/components/feedback/feedback_form";
import { FeedbackCard } from "@/components/feedback/feedback_card";
import { Loader2, ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";

export default function TaskFeedbackPage({ params }: { params: Promise<{ taskId: string }> }) {
  const router = useRouter();
  const { taskId } = use(params);
  const { appUser } = useCurrentAppUser();
  
  const [task, setTask] = useState<TaskResponse | null>(null);
  const [existingFeedbacks, setExistingFeedbacks] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const currentUserId = appUser?.id ?? null;

  // Assignees still needing feedback from current user
  const assigneesWithoutFeedback = (task.assignees || []).filter(
    (assignee) =>
      assignee.id !== currentUserId &&
      !existingFeedbacks.some(
        (f) => f.reviewer === currentUserId && f.to_app_user === assignee.id
      )
  );

  // Squads still needing feedback from current user
  const squadsWithoutFeedback = (task.squads || []).filter(
    (squad) =>
      !existingFeedbacks.some(
        (f) => f.reviewer === currentUserId && f.to_squad === squad.id
      )
  );

  const handleFeedbackSuccess = () => {
    loadData();
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave Feedback</h1>
          <p className="text-muted-foreground text-sm">
            Task: {task.title}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Pending feedback forms */}
        {assigneesWithoutFeedback.map((assignee) => (
          <FeedbackForm
            key={`user-${assignee.id}`}
            task={task}
            targetUser={assignee}
            onSuccess={handleFeedbackSuccess}
          />
        ))}
        {squadsWithoutFeedback.map((squad) => (
          <FeedbackForm
            key={`squad-${squad.id}`}
            task={task}
            targetSquad={squad}
            onSuccess={handleFeedbackSuccess}
          />
        ))}

        {assigneesWithoutFeedback.length === 0 && squadsWithoutFeedback.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
            <Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              All reviews submitted for this task.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => router.back()}>
              Back to Task
            </Button>
          </div>
        )}

        {/* Existing feedback */}
        {existingFeedbacks.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Submitted Reviews
              </h3>
              <Badge variant="secondary" className="text-xs h-5">{existingFeedbacks.length}</Badge>
            </div>
            {existingFeedbacks.map((fb) => (
              <FeedbackCard key={fb.id} feedback={fb} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
