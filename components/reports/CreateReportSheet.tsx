"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createReport, REPORT_RATING_FIELDS, type CreateReportRequest } from "@/services/reports";
import { getEmployees } from "@/services/company";

const RATING_OPTIONS = [1, 2, 3, 4, 5];

const EMPTY_FORM: CreateReportRequest = {
  title: "",
  employee: 0,
  period_type: "annual",
  period_start: "",
  period_end: "",
  technical_skills: 3,
  quality_of_work: 3,
  productivity: 3,
  communication: 3,
  teamwork: 3,
  initiative: 3,
  time_management: 3,
  leadership: null,
  key_achievements: "",
  strengths: "",
  areas_for_improvement: "",
  goals_next_period: "",
  additional_notes: "",
};

export function CreateReportSheet() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateReportRequest>(EMPTY_FORM);
  const queryClient = useQueryClient();

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
    enabled: open,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report created successfully");
      setForm(EMPTY_FORM);
      setOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create report");
    },
  });

  function set<K extends keyof CreateReportRequest>(key: K, value: CreateReportRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.employee || !form.title || !form.period_start || !form.period_end) {
      toast.error("Please fill in all required fields");
      return;
    }
    mutate(form);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          New Report
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl w-full max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Performance Report</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Row 1: Employee + Title */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Employee <span className="text-destructive">*</span></Label>
              <Select
                value={form.employee ? String(form.employee) : ""}
                onValueChange={(v) => set("employee", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee…" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.first_name} {emp.last_name}
                      {emp.role ? ` · ${emp.role}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Report Title <span className="text-destructive">*</span></Label>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Q1 2026 Performance Review"
              />
            </div>
          </div>

          {/* Row 2: Period type + start + end */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Period Type</Label>
              <Select
                value={form.period_type}
                onValueChange={(v) => set("period_type", v as "annual" | "semi_annual")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Period Start <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                value={form.period_start}
                onChange={(e) => set("period_start", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Period End <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                value={form.period_end}
                onChange={(e) => set("period_end", e.target.value)}
              />
            </div>
          </div>

          {/* Ratings — 4-col grid */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Performance Ratings (1–5)
            </Label>
            <div className="grid grid-cols-4 gap-3">
              {REPORT_RATING_FIELDS.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-xs">{f.label}</Label>
                  <Select
                    value={String(form[f.key])}
                    onValueChange={(v) =>
                      set(f.key, Number(v) as CreateReportRequest[typeof f.key])
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RATING_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-xs">Leadership (optional)</Label>
                <Select
                  value={form.leadership != null ? String(form.leadership) : "none"}
                  onValueChange={(v) => set("leadership", v === "none" ? null : Number(v))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">N/A</SelectItem>
                    {RATING_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Narrative sections — 2-col grid */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Narrative (optional)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "key_achievements" as const, label: "Key Achievements" },
                { key: "strengths" as const, label: "Strengths" },
                { key: "areas_for_improvement" as const, label: "Areas for Improvement" },
                { key: "goals_next_period" as const, label: "Goals for Next Period" },
              ].map((s) => (
                <div key={s.key} className="space-y-1.5">
                  <Label className="text-xs">{s.label}</Label>
                  <Textarea
                    value={(form[s.key] as string) ?? ""}
                    onChange={(e) => set(s.key, e.target.value)}
                    rows={3}
                    className="resize-none text-sm"
                    placeholder="Optional…"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Additional Notes</Label>
              <Textarea
                value={form.additional_notes ?? ""}
                onChange={(e) => set("additional_notes", e.target.value)}
                rows={2}
                className="resize-none text-sm"
                placeholder="Optional…"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating…</>
              ) : (
                "Create Report"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
