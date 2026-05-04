"use client";

import { useQuery } from "@tanstack/react-query";
import { listFeedback, FEEDBACK_ATTRIBUTES, type FeedbackResponse } from "@/services/feedback";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

function StarDisplay({ value, size = "sm" }: { value: number; size?: "sm" | "xs" }) {
  const iconSize = size === "xs" ? "h-3 w-3" : "h-4 w-4";
  return (
    <div className="flex gap-px">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            iconSize,
            star <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-muted-foreground/20"
          )}
        />
      ))}
    </div>
  );
}

function FeedbackHistoryItem({ feedback }: { feedback: FeedbackResponse }) {
  const reviewer = feedback.reviewer_detail;
  const reviewerName = `${reviewer.first_name} ${reviewer.last_name}`.trim() || reviewer.email;
  const avgStars = (feedback.rating / 5).toFixed(1);

  return (
    <div className="p-4 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
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
          {feedback.task_title && (
            <Link
              href={`/tasks/${feedback.task}`}
              className="text-xs text-muted-foreground hover:text-primary transition-colors mt-0.5 block truncate"
            >
              on &quot;{feedback.task_title}&quot;
            </Link>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-bold">{avgStars}</span>
          <span className="text-[10px] text-muted-foreground">/ 5</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-2">
        {FEEDBACK_ATTRIBUTES.map((attr) => (
          <div key={attr.key} className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium truncate">
              {attr.label}
            </span>
            <StarDisplay value={feedback[attr.key] as number} size="xs" />
          </div>
        ))}
      </div>

      {feedback.comment && (
        <div className="flex gap-2 mt-2 pt-2 border-t border-border/30">
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3">
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
    </div>
  );
}

interface FeedbackHistoryCardProps {
  employeeId: number;
}

export function FeedbackHistoryCard({ employeeId }: FeedbackHistoryCardProps) {
  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ["feedbacks", employeeId],
    queryFn: () => listFeedback(employeeId),
    staleTime: 1000 * 60 * 2,
  });

  const avgRating =
    feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length / 5).toFixed(1)
      : null;

  return (
    <Card className="border-none shadow-card bg-card/60 backdrop-blur-sm h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-semibold">Feedback</h3>
          </div>
          <div className="flex items-center gap-2">
            {avgRating && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold">{avgRating}</span>
              </div>
            )}
            <Badge variant="secondary" className="text-[10px]">
              {feedbacks.length} review{feedbacks.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground animate-pulse">
            Loading feedback…
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Star className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No feedback received yet.</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {feedbacks.map((feedback) => (
              <FeedbackHistoryItem key={feedback.id} feedback={feedback} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
