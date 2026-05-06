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
            "h-3 w-3",
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
    <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/employees/${reviewer.id}`}
              className="text-sm font-semibold hover:text-primary transition-colors"
            >
              {reviewerName}
            </Link>
            <span className="text-xs text-muted-foreground">for</span>
            <span className="text-sm font-medium">{targetName}</span>
            {feedback.to_squad_detail && (
              <Badge variant="secondary" className="text-[10px] h-4">
                Squad
              </Badge>
            )}
            {reviewer.role && (
              <Badge variant="outline" className="text-[10px] h-4 capitalize">
                {reviewer.role}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 bg-amber-500/10 px-2 py-0.5 rounded-full">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-amber-700">{avgStars}</span>
            <span className="text-[10px] text-amber-700/70">/ 5</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          {FEEDBACK_ATTRIBUTES.map((attr) => (
            <div key={attr.key} className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                {attr.label}
              </span>
              <StarDisplay value={feedback[attr.key] as number} />
            </div>
          ))}
        </div>

        {feedback.comment && (
          <div className="flex gap-2 mt-2 pt-3 border-t border-border/40 italic">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80 leading-relaxed">
              "{feedback.comment}"
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-2 border-t border-border/30">
          {feedback.task_title && (
            <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
              Task: {feedback.task_title}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground ml-auto">
            {new Date(feedback.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
