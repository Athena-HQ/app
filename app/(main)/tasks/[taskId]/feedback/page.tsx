"use client";

import * as React from "react";
import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  listFeedbackForTask,
  createFeedback,
  FEEDBACK_ATTRIBUTES,
  type FeedbackResponse,
  type FeedbackAttributeValue,
  type CreateFeedbackRequest,
} from "@/services/feedback";
import { taskService } from "@/services/task";
import type { AppUserResponse } from "@/services/company";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Star, MessageSquare, Send, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Star Rating Input ──────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: FeedbackAttributeValue) => void;
}) {
  const [hovered, setHovered] = React.useState(0);
  const display = hovered || value;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="p-0 transition-transform duration-100 hover:scale-125 cursor-pointer"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star as FeedbackAttributeValue)}
        >
          <Star
            className={cn(
              "h-7 w-7 transition-colors",
              star <= display
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Feedback Form Per Assignee ─────────────────────────────────────────────

function AssigneeFeedbackForm({
  taskId,
  assignee,
  onSuccess,
}: {
  taskId: number;
  assignee: AppUserResponse;
  onSuccess: () => void;
}) {
  const [ratings, setRatings] = React.useState<Record<string, FeedbackAttributeValue>>({
    communication: 3,
    quality_of_work: 3,
    timeliness: 3,
    teamwork: 3,
    initiative: 3,
  });
  const [comment, setComment] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const assigneeName = `${assignee.first_name} ${assignee.last_name}`.trim() || "Assignee";

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateFeedbackRequest) => createFeedback(data),
    onSuccess: () => {
      toast.success(`Feedback submitted for ${assigneeName}`);
      setSubmitted(true);
      onSuccess();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to submit feedback");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      to_app_user: assignee.id,
      task: taskId,
      communication: ratings.communication,
      quality_of_work: ratings.quality_of_work,
      timeliness: ratings.timeliness,
      teamwork: ratings.teamwork,
      initiative: ratings.initiative,
      comment: comment.trim() || null,
    });
  };

  const totalRating = Object.values(ratings).reduce((a, b) => a + b, 0);
  const avgRating = (totalRating / 5).toFixed(1);

  if (submitted) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="py-6 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          <div>
            <p className="font-semibold text-sm">Feedback submitted for {assigneeName}</p>
            <p className="text-xs text-muted-foreground">
              {avgRating} / 5 average
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="pt-6 pb-5">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {assignee.first_name?.[0]?.toUpperCase() || "?"}
                {assignee.last_name?.[0]?.toUpperCase() || ""}
              </div>
              <div>
                <h3 className="font-semibold">{assigneeName}</h3>
                {assignee.role && (
                  <p className="text-xs text-muted-foreground capitalize">{assignee.role}</p>
                )}
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
              {avgRating} / 5
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-5 mb-5">
            {FEEDBACK_ATTRIBUTES.map((attr) => (
              <div key={attr.key} className="flex flex-col gap-2">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  {attr.label}
                </span>
                <StarRating
                  value={ratings[attr.key]}
                  onChange={(v) =>
                    setRatings((prev) => ({ ...prev, [attr.key]: v }))
                  }
                />
              </div>
            ))}
          </div>

          <div className="mb-5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 block">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts on their performance (optional)..."
              rows={3}
              maxLength={1000}
              className="w-full rounded-lg border border-input bg-transparent px-4 py-3 text-sm shadow-xs placeholder:text-muted-foreground outline-none resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} className="min-w-[160px]">
              <Send className="h-4 w-4 mr-2" />
              {isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function TaskFeedbackPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = use(params);
  const numericId = parseInt(taskId, 10);
  const router = useRouter();
  const { appUser } = useCurrentAppUser();
  const queryClient = useQueryClient();

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ["task", numericId],
    queryFn: () => taskService.getTaskById(String(numericId)),
    enabled: !isNaN(numericId),
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ["taskFeedback", numericId],
    queryFn: () => listFeedbackForTask(numericId),
    enabled: !isNaN(numericId),
  });

  if (taskLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Loading task…</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-destructive">Task not found.</div>
      </div>
    );
  }

  const currentUserId = appUser?.id ?? null;
  const isAssigner = task.assigned_by && currentUserId === task.assigned_by.id;

  // Filter: exclude self, exclude already-reviewed assignees
  const assigneesNeedingFeedback = isAssigner
      ? (task.assignees || []).filter(
        (assignee: AppUserResponse) =>
          assignee.id !== currentUserId && // No self-feedback
          !feedbacks.some(
            (f) => f.reviewer === currentUserId && f.to_app_user === assignee.id
          )
      )
    : [];

  const allDone = assigneesNeedingFeedback.length === 0 && feedbacks.length > 0;

  const handleFeedbackSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["taskFeedback", numericId] });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 text-muted-foreground"
          onClick={() => router.push(`/tasks/${taskId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to task
        </Button>

        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10">
            <Star className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Give Feedback</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Rate the assignees on <span className="font-medium text-foreground">&quot;{task.title}&quot;</span>
            </p>
          </div>
        </div>
      </div>

      {!isAssigner ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Star className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Only the task assigner can give feedback.
            </p>
          </CardContent>
        </Card>
      ) : task.status !== "completed" ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Star className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Feedback can only be given after the task is completed.
            </p>
          </CardContent>
        </Card>
      ) : allDone ? (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">All feedback submitted!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You&apos;ve reviewed all assignees on this task.
            </p>
            <Button variant="outline" onClick={() => router.push(`/tasks/${taskId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {assigneesNeedingFeedback.map((assignee: AppUserResponse) => (
            <AssigneeFeedbackForm
              key={assignee.id}
              taskId={numericId}
              assignee={assignee}
              onSuccess={handleFeedbackSuccess}
            />
          ))}
        </div>
      )}

      {/* Show existing feedbacks */}
      {feedbacks.length > 0 && (
        <>
          <Separator className="my-8" />
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Submitted Feedback</h2>
            <Badge variant="secondary" className="text-xs">{feedbacks.length}</Badge>
          </div>
          <div className="space-y-3">
            {feedbacks.map((f) => {
              const name = `${f.reviewer_detail.first_name} ${f.reviewer_detail.last_name}`.trim();
              const targetName = `${f.to_app_user_detail.first_name} ${f.to_app_user_detail.last_name}`.trim();
              return (
                <Card key={f.id} className="border-border/50 bg-card/60">
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{name}</span>
                        <span className="text-xs text-muted-foreground">→</span>
                        <Link href={`/employees/${f.to_app_user}`} className="text-sm font-medium text-primary hover:underline">
                          {targetName}
                        </Link>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold">{(f.rating / 5).toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">/ 5</span>
                      </div>
                    </div>
                    {f.comment && (
                      <p className="text-sm text-foreground/70 mt-1">{f.comment}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
