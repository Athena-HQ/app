"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createReport, type CreateReportRequest } from "@/services/reports";
import { queryKeys } from "@/lib/query-keys";
import { useEmployees } from "@/hooks/useCurrentAppUser";
import { Star } from "lucide-react";

interface ReportCreateDialogProps {
  open: boolean;
  onClose: () => void;
}

const RATING_FIELDS = [
  { key: "technical_skills", label: "Technical Skills" },
  { key: "quality_of_work", label: "Quality of Work" },
  { key: "productivity", label: "Productivity & Efficiency" },
  { key: "communication", label: "Communication Skills" },
  { key: "teamwork", label: "Teamwork & Collaboration" },
  { key: "initiative", label: "Initiative & Innovation" },
  { key: "time_management", label: "Time Management" },
] as const;

type RatingKey = (typeof RATING_FIELDS)[number]["key"];

type RatingValues = Record<RatingKey, number> & { leadership: number | null };

const DEFAULT_RATINGS: RatingValues = {
  technical_skills: 3,
  quality_of_work: 3,
  productivity: 3,
  communication: 3,
  teamwork: 3,
  initiative: 3,
  time_management: 3,
  leadership: null,
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 focus-visible:outline-none"
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              n <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground self-center">{value}/5</span>
    </div>
  );
}

export function ReportCreateDialog({ open, onClose }: ReportCreateDialogProps) {
  const queryClient = useQueryClient();
  const { employees } = useEmployees();

  const [title, setTitle] = useState("");
  const [employeeId, setEmployeeId] = useState<string>("");
  const [periodType, setPeriodType] = useState<"annual" | "semi_annual">("annual");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [ratings, setRatings] = useState<RatingValues>(DEFAULT_RATINGS);
  const [narrative, setNarrative] = useState({
    key_achievements: "",
    strengths: "",
    areas_for_improvement: "",
    goals_next_period: "",
    additional_notes: "",
  });
  const [includeLeadership, setIncludeLeadership] = useState(false);

  function resetForm() {
    setTitle("");
    setEmployeeId("");
    setPeriodType("annual");
    setPeriodStart("");
    setPeriodEnd("");
    setRatings(DEFAULT_RATINGS);
    setNarrative({
      key_achievements: "",
      strengths: "",
      areas_for_improvement: "",
      goals_next_period: "",
      additional_notes: "",
    });
    setIncludeLeadership(false);
  }

  const mutation = useMutation({
    mutationFn: (data: CreateReportRequest) => createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      toast.success("Report created successfully.");
      resetForm();
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create report.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId || !periodStart || !periodEnd || !title.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    mutation.mutate({
      title: title.trim(),
      employee: Number(employeeId),
      period_type: periodType,
      period_start: periodStart,
      period_end: periodEnd,
      ...ratings,
      leadership: includeLeadership ? (ratings.leadership ?? 3) : null,
      ...narrative,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { resetForm(); onClose(); } }}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Performance Report</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Basic info */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Report Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Annual Performance Review 2026"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Employee <span className="text-destructive">*</span></Label>
                <Select value={employeeId} onValueChange={setEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.first_name} {e.last_name}
                        {e.role && <span className="text-muted-foreground ml-1 text-xs">({e.role})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Period Type <span className="text-destructive">*</span></Label>
                <Select value={periodType} onValueChange={(v) => setPeriodType(v as "annual" | "semi_annual")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="period_start">Period Start <span className="text-destructive">*</span></Label>
                <Input id="period_start" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="period_end">Period End <span className="text-destructive">*</span></Label>
                <Input id="period_end" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div>
            <p className="text-sm font-semibold mb-3">Performance Ratings</p>
            <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4">
              {RATING_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <Label className="text-sm w-48 shrink-0">{label}</Label>
                  <StarRating
                    value={ratings[key]}
                    onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))}
                  />
                </div>
              ))}

              {/* Leadership (optional) */}
              <div className="flex items-center justify-between gap-3 pt-1 border-t">
                <div className="flex items-center gap-2 w-48 shrink-0">
                  <input
                    type="checkbox"
                    id="include_leadership"
                    checked={includeLeadership}
                    onChange={(e) => {
                      setIncludeLeadership(e.target.checked);
                      if (e.target.checked && ratings.leadership === null) {
                        setRatings((prev) => ({ ...prev, leadership: 3 }));
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor="include_leadership" className="text-sm cursor-pointer">
                    Leadership <span className="text-xs text-muted-foreground">(optional)</span>
                  </Label>
                </div>
                {includeLeadership && (
                  <StarRating
                    value={ratings.leadership ?? 3}
                    onChange={(v) => setRatings((prev) => ({ ...prev, leadership: v }))}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Narrative */}
          <div>
            <p className="text-sm font-semibold mb-3">Narrative Assessment</p>
            <div className="flex flex-col gap-3">
              {[
                { key: "key_achievements", label: "Key Achievements" },
                { key: "strengths", label: "Areas of Strength" },
                { key: "areas_for_improvement", label: "Areas for Development / Improvement" },
                { key: "goals_next_period", label: "Goals for Next Period" },
                { key: "additional_notes", label: "Additional Notes & Recommendations" },
              ].map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <Label htmlFor={key} className="text-sm">{label}</Label>
                  <Textarea
                    id={key}
                    rows={3}
                    value={narrative[key as keyof typeof narrative]}
                    onChange={(e) =>
                      setNarrative((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder="Optional..."
                    className="resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => { resetForm(); onClose(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating…" : "Create Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
