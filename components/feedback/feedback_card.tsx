"use client";

import * as React from "react";
import { Star, MessageSquare, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { type FeedbackResponse, FEEDBACK_ATTRIBUTES } from "@/services/feedback";

function StarDisplay({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= value
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted/20 text-muted-foreground/20"
          )}
        />
      ))}
    </div>
  );
}

export function FeedbackCard({ feedback }: { feedback: FeedbackResponse }) {
  const reviewer = feedback.reviewer_detail;
  const reviewerName = `${reviewer.first_name} ${reviewer.last_name}`.trim() || reviewer.email;
  const reviewerInitials = (reviewer.first_name?.[0] || "" + reviewer.last_name?.[0] || "").toUpperCase() || "?";
  
  const targetName = feedback.to_app_user_detail 
    ? `${feedback.to_app_user_detail.first_name} ${feedback.to_app_user_detail.last_name}`.trim() || feedback.to_app_user_detail.email
    : feedback.to_squad_detail?.name || "Squad";
  
  const avgStars = (feedback.rating / 5).toFixed(1);

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side: Profile & Overall Rating */}
          <div className="flex flex-col items-center md:items-start gap-4 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-slate-50 shadow-sm">
                <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                  {reviewerInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link
                  href={`/employees/${reviewer.id}`}
                  className="font-bold text-slate-900 hover:text-primary transition-colors block"
                >
                  {reviewerName}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-5 font-bold border-slate-200 text-slate-500">
                    {reviewer.role || "Reviewer"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 w-full bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-slate-100">
              <div className="text-3xl font-black text-slate-900 leading-none">{avgStars}</div>
              <div className="flex gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= Math.round(parseFloat(avgStars))
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-slate-200 text-slate-200"
                    )}
                  />
                ))}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                Overall Rating
              </div>
            </div>

            <div className="mt-auto pt-4 flex flex-col gap-1 w-full">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Feedback for</div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 truncate">{targetName}</span>
                {feedback.to_squad_detail && (
                  <Badge className="bg-info/10 text-info hover:bg-info/15 border-none text-[10px] h-5">
                    Squad
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Detailed Metrics & Comment */}
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 gap-y-3">
              {FEEDBACK_ATTRIBUTES.map((attr) => (
                <div key={attr.key} className="flex items-center justify-between group">
                  <span className="text-sm font-medium text-slate-500 group-hover:text-slate-900 transition-colors">
                    {attr.label}
                  </span>
                  <div className="flex items-center gap-4">
                    <StarDisplay value={feedback[attr.key] as number} />
                    <span className="text-xs font-bold text-slate-400 w-4 text-right">
                      {feedback[attr.key] as number}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {feedback.comment && (
              <div className="relative bg-slate-50/50 rounded-2xl p-5 border border-slate-100 italic">
                <Quote className="absolute -top-3 -left-1 h-6 w-6 text-slate-200 fill-slate-200 -rotate-12" />
                <p className="text-sm text-slate-700 leading-relaxed relative z-10">
                  {feedback.comment}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              {feedback.task_title && (
                <div className="flex items-center gap-1.5 truncate max-w-[250px]">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Task: {feedback.task_title}</span>
                </div>
              )}
              <div className="ml-auto">
                {new Date(feedback.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
