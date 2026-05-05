"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  listFeedbackForTask,
  FEEDBACK_ATTRIBUTES,
  type FeedbackResponse,
} from "@/services/feedback";
import type { TaskResponse } from "@/services/task";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquare, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Star Rating Display (readonly) ────────────────────────────────────────

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

// ─── Feedback Card (display existing feedback) ──────────────────────────────

function FeedbackCard({ feedback }: { feedback: FeedbackResponse }) {
  const reviewer = feedback.reviewer_detail;
  const reviewerName = `${reviewer.first_name} ${reviewer.last_name}`.trim() || reviewer.email;
  const avgStars = (feedback.rating / 5).toFixed(1);

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
              <StarDisplay value={feedback[attr.key] as number} />
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

// ─── Main Section ───────────────────────────────────────────────────────────

export function TaskFeedbackSection({ task }: { task: TaskResponse }) {
  const { appUser } = useCurrentAppUser();

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ["taskFeedback", task.id],
    queryFn: () => listFeedbackForTask(task.id),
    enabled: ["completed", "under_review", "reviewed"].includes(task.status),
    staleTime: 1000 * 60,
  });

  if (!["completed", "under_review", "reviewed"].includes(task.status)) return null;

  const currentUserId = appUser ? appUser.id : null;
  const isAssigner = task.assigned_by && currentUserId === task.assigned_by.id;

  // Check if there are assignees still needing feedback (exclude self)
  const assigneesWithoutFeedback = isAssigner
    ? (task.assignees || []).filter(
        (assignee) =>
          assignee.id !== currentUserId && // No self-feedback
          !feedbacks.some(
            (f) =>
              f.reviewer === currentUserId &&
              f.to_app_user === assignee.id
          )
      )
    : [];

  const hasPendingFeedback = assigneesWithoutFeedback.length > 0;

  return (
    <>
      <Separator />
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Feedback</h2>
            {feedbacks.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {feedbacks.length}
              </Badge>
            )}
          </div>

          {/* Give Feedback button — only for assigner with pending feedback */}
          {hasPendingFeedback && (
            <Button asChild size="sm">
              <Link href={`/tasks/${task.id}/feedback`}>
                <Star className="h-4 w-4 mr-2" />
                Give Feedback
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>

        {/* Existing feedback display */}
        {isLoading ? (
          <div className="text-sm text-muted-foreground animate-pulse py-4 text-center">
            Loading feedback…
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
            <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {isAssigner && hasPendingFeedback
                ? "Click \"Give Feedback\" to rate the assignees."
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
