"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listFeedbackForTask,
} from "@/services/feedback";
import { FeedbackCard } from "@/components/feedback/feedback_card";
import { FeedbackForm } from "@/components/feedback/feedback_form";
import type { TaskResponse } from "@/services/task";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";

export function TaskFeedbackSection({ task }: { task: TaskResponse }) {
  const { appUser } = useCurrentAppUser();
  const queryClient = useQueryClient();

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ["taskFeedback", task.id],
    queryFn: () => listFeedbackForTask(task.id),
    enabled: ["completed", "under_review", "reviewed"].includes(task.status),
    staleTime: 1000 * 60,
  });

  if (!["completed", "under_review", "reviewed"].includes(task.status)) return null;

  const currentUserId = appUser ? appUser.id : null;
  const isAssigner = task.assigned_by && currentUserId === task.assigned_by.id;

  // Determine which assignees/squads still need feedback from this assigner
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

  const handleFeedbackSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["taskFeedback", task.id] });
  };

  return (
    <>
      <Separator className="my-8" />
      <div className="space-y-6">
        <div className="flex items-center gap-2.5">
          <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">Feedback</h2>
          {feedbacks.length > 0 && (
            <Badge variant="secondary" className="text-xs h-6 px-2 font-bold">
              {feedbacks.length}
            </Badge>
          )}
        </div>

        {/* Feedback forms for assignees that still need feedback */}
        {(assigneesWithoutFeedback.length > 0 || squadsWithoutFeedback.length > 0) && (
          <div className="space-y-4">
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
          </div>
        )}

        {/* Existing feedback */}
        {isLoading ? (
          <div className="text-sm text-muted-foreground animate-pulse py-8 text-center bg-muted/5 rounded-2xl border border-dashed border-border/40">
            Loading performance feedback…
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
            <Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium max-w-[250px] mx-auto">
              {isAssigner
                ? "Use the forms above to provide performance feedback for the team."
                : "No performance feedback has been recorded for this task yet."}
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
