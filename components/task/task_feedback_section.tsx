"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listFeedbackForTask,
  createFeedback,
  FEEDBACK_ATTRIBUTES,
  type FeedbackResponse,
  type FeedbackAttributeValue,
  type CreateFeedbackRequest,
} from "@/services/feedback";
import type { TaskResponse } from "@/services/task";
import type { AppUserResponse } from "@/services/company";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Star, MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Star Rating Input ──────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: FeedbackAttributeValue) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = React.useState(0);
  const display = readonly ? value : hovered || value;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={cn(
            "p-0 transition-transform duration-100",
            !readonly && "hover:scale-110 cursor-pointer",
            readonly && "cursor-default"
          )}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => onChange?.(star as FeedbackAttributeValue)}
        >
          <Star
            className={cn(
              "h-5 w-5 transition-colors",
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

// ─── Feedback Card (display existing feedback) ──────────────────────────────

function FeedbackCard({ feedback }: { feedback: FeedbackResponse }) {
  const reviewer = feedback.reviewer_detail;
  const reviewerName = `${reviewer.first_name} ${reviewer.last_name}`.trim() || reviewer.email;
  const totalStars = feedback.rating;
  const avgStars = (totalStars / 5).toFixed(1);

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Link
              href={`/employees/${reviewer.id}`}
              className="text-sm font-semibold hover:text-primary transition-colors"
            >
              {reviewerName}
            </Link>
            {reviewer.role && (
              <Badge variant="outline" className="text-[10px] capitalize">
                {reviewer.role}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold">{avgStars}</span>
            <span className="text-xs text-muted-foreground">/ 5</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
          {FEEDBACK_ATTRIBUTES.map((attr) => (
            <div key={attr.key} className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {attr.label}
              </span>
              <StarRating
                value={feedback[attr.key] as number}
                readonly
              />
            </div>
          ))}
        </div>

        {feedback.comment && (
          <div className="flex gap-2 mt-2 pt-2 border-t border-border/50">
            <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80 leading-relaxed">
              {feedback.comment}
            </p>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground mt-2">
          {new Date(feedback.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Feedback Form ──────────────────────────────────────────────────────────

function FeedbackForm({
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
  const assigneeName = `${assignee.first_name} ${assignee.last_name}`.trim();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateFeedbackRequest) => createFeedback(data),
    onSuccess: () => {
      toast.success(`Feedback submitted for ${assigneeName}`);
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

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-5 pb-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-semibold">
              Rate {assigneeName}
            </h4>
            <Badge variant="outline" className="text-[10px]">
              {totalRating}/25 stars
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
            {FEEDBACK_ATTRIBUTES.map((attr) => (
              <div key={attr.key} className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
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

          <div className="mb-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)..."
              rows={2}
              maxLength={1000}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground outline-none resize-none"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isPending}>
              <Send className="h-4 w-4 mr-2" />
              {isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Main Section ───────────────────────────────────────────────────────────

export function TaskFeedbackSection({ task }: { task: TaskResponse }) {
  const { appUser } = useCurrentAppUser();
  const queryClient = useQueryClient();

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ["taskFeedback", task.id],
    queryFn: () => listFeedbackForTask(task.id),
    enabled: task.status === "completed",
    staleTime: 1000 * 60,
  });

  // Only show this section if the task is completed
  if (task.status !== "completed") return null;

  const currentUserId = appUser ? appUser.id : null;
  const isAssigner = task.assigned_by && currentUserId === task.assigned_by.id;

  // Determine which assignees still need feedback from this assigner
  const assigneesWithoutFeedback = isAssigner
    ? (task.assignees || []).filter(
        (assignee) =>
          !feedbacks.some(
            (f) =>
              f.reviewer === currentUserId &&
              f.to_app_user === assignee.id
          )
      )
    : [];

  const handleFeedbackSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["taskFeedback", task.id] });
  };

  return (
    <>
      <Separator />
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Feedback</h2>
          {feedbacks.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {feedbacks.length}
            </Badge>
          )}
        </div>

        {/* Feedback forms for assignees that still need feedback */}
        {assigneesWithoutFeedback.length > 0 && (
          <div className="space-y-3 mb-4">
            {assigneesWithoutFeedback.map((assignee) => (
              <FeedbackForm
                key={assignee.id}
                taskId={task.id}
                assignee={assignee}
                onSuccess={handleFeedbackSuccess}
              />
            ))}
          </div>
        )}

        {/* Existing feedback */}
        {isLoading ? (
          <div className="text-sm text-muted-foreground animate-pulse py-4 text-center">
            Loading feedback…
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
            <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {isAssigner
                ? "Use the forms above to give feedback to assignees."
                : "No feedback has been given yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {feedbacks.map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
