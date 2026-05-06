"use client";

import * as React from "react";
import { Star, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { type FeedbackResponse, FEEDBACK_ATTRIBUTES } from "@/services/feedback";

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4 transition-colors",
            star <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
}

export function FeedbackCard({ feedback }: { feedback: FeedbackResponse }) {
  const reviewer = feedback.reviewer_detail;
  const reviewerName = `${reviewer.first_name} ${reviewer.last_name}`.trim() || reviewer.email;
  
  const targetName = feedback.to_app_user_detail 
    ? `${feedback.to_app_user_detail.first_name} ${feedback.to_app_user_detail.last_name}`.trim() || feedback.to_app_user_detail.email
    : feedback.to_squad_detail?.name || "Squad";
  
  const avgStars = (feedback.rating / 5).toFixed(1);

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Link
              href={`/employees/${reviewer.id}`}
              className="text-sm font-semibold hover:text-primary transition-colors"
            >
              {reviewerName}
            </Link>
            {reviewer.role && (
              <Badge variant="outline" className="text-[10px] capitalize h-5 font-medium">
                {reviewer.role}
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              • for <span className="text-foreground font-medium">{targetName}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-amber-500">{avgStars}</span>
            <span className="text-[10px] text-amber-500/60 font-medium">/ 5</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
          {FEEDBACK_ATTRIBUTES.map((attr) => (
            <div key={attr.key} className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                {attr.label}
              </span>
              <StarDisplay value={feedback[attr.key] as number} />
            </div>
          ))}
        </div>

        {feedback.comment && (
          <div className="flex gap-2.5 mt-3 pt-3 border-t border-border/40">
            <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-50" />
            <p className="text-sm text-foreground/90 leading-relaxed italic">
              &quot;{feedback.comment}&quot;
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground font-medium opacity-60">
          {feedback.task_title && (
            <span className="truncate max-w-[300px]">Task: {feedback.task_title}</span>
          )}
          <span>
            {new Date(feedback.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
