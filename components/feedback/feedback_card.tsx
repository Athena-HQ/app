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
              : "fill-white/5 text-white/5"
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
    <Card className="border border-white/5 shadow-2xl bg-[#111111]/60 backdrop-blur-xl overflow-hidden hover:bg-[#111111]/80 transition-all duration-500 group">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Left Side: Profile & Overall Rating */}
          <div className="flex flex-col items-center md:items-start gap-6 md:w-1/3 border-b md:border-b-0 md:border-r border-white/5 pb-8 md:pb-0 md:pr-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-14 w-14 border border-white/10 shadow-xl">
                  <AvatarFallback className="bg-white/5 text-white/70 font-black text-lg">
                    {reviewerInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-yellow-400 rounded-full border-2 border-[#111111] flex items-center justify-center">
                  <Star className="h-2.5 w-2.5 text-[#111111] fill-[#111111]" />
                </div>
              </div>
              <div>
                <Link
                  href={`/employees/${reviewer.id}`}
                  className="font-black text-lg text-white/90 hover:text-yellow-400 transition-colors block tracking-tight"
                >
                  {reviewerName}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-white/30">
                    {reviewer.role || "Reviewer"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2 w-full bg-white/[0.02] rounded-[32px] p-6 flex flex-col items-center justify-center border border-white/5 shadow-inner">
              <div className="text-4xl font-black text-white leading-none tracking-tighter">{avgStars}</div>
              <div className="flex gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= Math.round(parseFloat(avgStars))
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-white/10 text-white/10"
                    )}
                  />
                ))}
              </div>
              <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-3">
                Overall Performance
              </div>
            </div>

            <div className="mt-auto pt-4 flex flex-col gap-2 w-full">
              <div className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em]">Feedback for</div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-white/70 truncate text-sm">{targetName}</span>
                {feedback.to_squad_detail && (
                  <Badge className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-none text-[9px] font-black h-5 uppercase tracking-wider">
                    Squad
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Detailed Metrics & Comment */}
          <div className="flex-1 space-y-8">
            <div className="grid grid-cols-1 gap-y-4">
              {FEEDBACK_ATTRIBUTES.map((attr) => (
                <div key={attr.key} className="flex items-center justify-between group/row">
                  <span className="text-xs font-bold text-white/40 group-hover/row:text-white/80 transition-colors uppercase tracking-wider">
                    {attr.label}
                  </span>
                  <div className="flex items-center gap-5">
                    <StarDisplay value={feedback[attr.key] as number} />
                    <span className="text-[10px] font-black text-white/20 w-4 text-right tabular-nums">
                      {feedback[attr.key] as number}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {feedback.comment && (
              <div className="relative bg-white/[0.03] rounded-3xl p-6 border border-white/5 shadow-sm group-hover:bg-white/[0.04] transition-colors">
                <Quote className="absolute -top-3 -left-1 h-7 w-7 text-white/5 fill-white/5 -rotate-12" />
                <p className="text-sm text-white/60 leading-relaxed relative z-10 font-medium italic">
                  &quot;{feedback.comment}&quot;
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-white/20 font-black uppercase tracking-widest pt-2">
              {feedback.task_title && (
                <div className="flex items-center gap-2 truncate max-w-[250px] hover:text-white/40 transition-colors">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Task: {feedback.task_title}</span>
                </div>
              )}
              <div className="ml-auto opacity-60">
                {new Date(feedback.created_at).toLocaleDateString("en-US", {
                  month: "short",
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
