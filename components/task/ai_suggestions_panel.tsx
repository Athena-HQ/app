"use client";

import { Sparkles, Zap, Clock, Star, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AISuggestion } from "@/hooks/useAISuggestions";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConfidencePip({ confidence }: { confidence: AISuggestion["confidence"] }) {
  const map: Record<AISuggestion["confidence"], { label: string; cls: string }> = {
    high: { label: "High fit", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    medium: { label: "Good fit", cls: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
    low: { label: "Possible fit", cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  };
  const { label, cls } = map[confidence] ?? map.medium;
  return (
    <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider", cls)}>
      {label}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const labels = ["#1 Best match", "#2 Runner-up", "#3 Alternate"];
  const colors = [
    "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "bg-slate-500/20 text-slate-400 border-slate-500/30",
    "bg-orange-700/20 text-orange-400 border-orange-700/30",
  ];
  return (
    <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-bold", colors[rank] ?? colors[2])}>
      {labels[rank] ?? `#${rank + 1}`}
    </span>
  );
}

function SuggestionSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 flex gap-4 items-start animate-pulse">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AISuggestionsPanelProps {
  suggestions: AISuggestion[];
  loading: boolean;
  error: string | null;
  onTrigger: () => void;
  onPick: (employeeId: number) => void;
  disabled: boolean;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AISuggestionsPanel({
  suggestions,
  loading,
  error,
  onTrigger,
  onPick,
  disabled,
}: AISuggestionsPanelProps) {
  const hasResults = suggestions.length > 0;

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        {/* Trigger button */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onTrigger}
            disabled={disabled || loading}
            className={cn(
              "gap-2 border-violet-500/40 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300 transition-all",
              loading && "opacity-60 cursor-wait"
            )}
            id="ai-suggest-btn"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Analyzing team…" : "Suggest with AI"}
          </Button>
          {disabled && !loading && (
            <p className="text-xs text-muted-foreground">
              Add a title &amp; description first
            </p>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && <SuggestionSkeleton />}

        {/* Results */}
        {!loading && hasResults && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Top {suggestions.length} suggested engineers
            </p>

            {suggestions.map((s, idx) => {
              const initials = s.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={s.employee_id}
                  className={cn(
                    "relative rounded-xl border bg-card p-4 flex gap-4 items-start transition-all hover:bg-muted/30",
                    idx === 0 && "border-violet-500/30 shadow-[0_0_12px_0_rgba(139,92,246,0.08)]"
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className="text-sm font-semibold bg-violet-500/15 text-violet-300">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{s.name}</span>
                      <RankBadge rank={idx} />
                      <ConfidencePip confidence={s.confidence} />
                      {s.is_busy && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-400 border-amber-500/30 flex items-center gap-1 cursor-default">
                              <Clock className="h-3 w-3" />
                              Busy
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{s.open_task_count} open tasks — may be overloaded</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>

                    {/* Role + XP */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground mb-2">
                      <span className="capitalize">{s.role}</span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-400" />
                        {s.xp_level} · {s.total_xp.toLocaleString()} XP
                      </span>
                      {s.avg_feedback_rating !== null && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          {s.avg_feedback_rating.toFixed(1)} / 5
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        {s.open_task_count} open task{s.open_task_count !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Skills */}
                    {s.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {s.skills.slice(0, 5).map((sk) => (
                          <Badge
                            key={sk}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {sk}
                          </Badge>
                        ))}
                        {s.skills.length > 5 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            +{s.skills.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* AI reason */}
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      &ldquo;{s.reason}&rdquo;
                    </p>
                  </div>

                  {/* Pick button */}
                  <Button
                    type="button"
                    size="sm"
                    variant={idx === 0 ? "default" : "outline"}
                    onClick={() => onPick(s.employee_id)}
                    className={cn(
                      "shrink-0 self-center",
                      idx === 0 && "bg-violet-600 hover:bg-violet-700 text-white"
                    )}
                    id={`ai-pick-${s.employee_id}`}
                  >
                    Pick
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
