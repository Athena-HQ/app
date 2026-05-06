"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  listFeedbackForTask,
} from "@/services/feedback";
import { FeedbackCard } from "@/components/feedback/feedback_card";
import type { TaskResponse } from "@/services/task";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, ArrowRight } from "lucide-react";
import Link from "next/link";

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
          assignee.id !== currentUserId &&
          !feedbacks.some(
            (f) =>
              f.reviewer === currentUserId &&
              f.to_app_user === assignee.id
          )
      )
    : [];

  const squadsWithoutFeedback = isAssigner
    ? (task.squads || []).filter(
        (squad) =>
          !feedbacks.some(
            (f) =>
              f.reviewer === currentUserId &&
              f.to_squad === squad.id
          )
      )
    : [];

  const hasPendingFeedback = assigneesWithoutFeedback.length > 0 || squadsWithoutFeedback.length > 0;

  return (
    <>
      <Separator />
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Feedback</h2>
              {feedbacks.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''} received
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">No feedback yet</p>
              )}
            </div>
          </div>

          {/* Give Feedback button — only for assigner with pending feedback */}
          {hasPendingFeedback && (
            <Button asChild size="sm" variant="default" className="shadow-sm">
              <Link href={`/tasks/${task.id}/feedback`}>
                <Star className="h-4 w-4 mr-2" />
                Give Feedback
                <ArrowRight className="h-4 w-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            </Button>
          )}
        </div>

        {/* Existing feedback display */}
        {isLoading ? (
          <div className="text-sm text-muted-foreground animate-pulse py-8 text-center bg-muted/10 rounded-lg border border-dashed">
            Loading feedback…
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center">
            <div className="h-12 w-12 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
              {isAssigner && hasPendingFeedback
                ? "Click \"Give Feedback\" to rate the assignees' performance."
                : "No feedback has been recorded for this task yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {feedbacks.map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
