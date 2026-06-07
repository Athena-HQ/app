"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Loader2, Star, FileText } from "lucide-react";
import {
  getReport,
  fetchReportPdfBlob,
  getReportPdfDownloadUrl,
  REPORT_RATING_FIELDS,
  GRADE_COLORS,
  type ReportListItem,
} from "@/services/reports";
import { getAccessToken } from "@/lib/auth/token-store";

function RatingBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-xs font-semibold w-6 text-right">{value}/5</span>
    </div>
  );
}

function PdfViewer({ reportId }: { reportId: number }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;

    fetchReportPdfBlob(reportId)
      .then((url) => {
        objectUrl = url;
        setBlobUrl(url);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading PDF…
      </div>
    );
  }
  if (error || !blobUrl) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Could not load PDF preview.
      </div>
    );
  }
  return (
    <iframe
      src={blobUrl}
      className="w-full rounded-lg border border-border"
      style={{ height: "480px" }}
      title="Report PDF"
    />
  );
}

interface ReportDetailDialogProps {
  report: ReportListItem | null;
  open: boolean;
  onClose: () => void;
}

export function ReportDetailDialog({ report, open, onClose }: ReportDetailDialogProps) {
  const { data: detail, isLoading } = useQuery({
    queryKey: ["report", report?.id],
    queryFn: () => getReport(report!.id),
    enabled: !!report,
  });

  const gradeClass = detail
    ? (GRADE_COLORS[detail.overall_grade] ?? "text-gray-600 bg-gray-50 border-gray-200")
    : "";

  const downloadUrl = detail
    ? getReportPdfDownloadUrl(detail.id)
    : null;

  function handleDownload() {
    if (!downloadUrl) return;
    const token = getAccessToken();
    fetch(downloadUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `report_${detail!.id}.pdf`;
        a.click();
      });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {report?.title ?? "Report"}
          </DialogTitle>
        </DialogHeader>

        {isLoading || !detail ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Employee: </span>
                <span className="font-semibold">{detail.employee_name}</span>
                {detail.employee_role && (
                  <Badge variant="outline" className="ml-2 text-[10px] capitalize">
                    {detail.employee_role}
                  </Badge>
                )}
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div>
                <span className="text-muted-foreground">By: </span>
                <span className="font-semibold">{detail.created_by_name}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <Badge variant="secondary" className="capitalize">
                {detail.period_type === "annual" ? "Annual" : "Semi-Annual"}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {detail.period_start} → {detail.period_end}
              </span>
            </div>

            {/* Overall rating */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-3xl font-bold">{detail.overall_rating.toFixed(1)}</span>
                <span className="text-muted-foreground">/ 5</span>
              </div>
              <Badge className={`border text-sm px-3 py-1 ${gradeClass}`}>
                {detail.overall_grade}
              </Badge>
            </div>

            {/* Rating breakdown */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">
                Performance Ratings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REPORT_RATING_FIELDS.map((f) => (
                  <div key={f.key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{f.label}</span>
                    </div>
                    <RatingBar value={detail[f.key] as number} />
                  </div>
                ))}
                {detail.leadership != null && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Leadership</span>
                    </div>
                    <RatingBar value={detail.leadership} />
                  </div>
                )}
              </div>
            </div>

            {/* Narrative sections */}
            {[
              { label: "Key Achievements", value: detail.key_achievements },
              { label: "Strengths", value: detail.strengths },
              { label: "Areas for Improvement", value: detail.areas_for_improvement },
              { label: "Goals for Next Period", value: detail.goals_next_period },
              { label: "Additional Notes", value: detail.additional_notes },
            ]
              .filter((s) => s.value?.trim())
              .map((s) => (
                <div key={s.label}>
                  <h4 className="text-sm font-semibold mb-1 text-muted-foreground uppercase tracking-wider">
                    {s.label}
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {s.value}
                  </p>
                </div>
              ))}

            <Separator />

            {/* PDF section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  PDF Report
                </h4>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-1.5" />
                  Download
                </Button>
              </div>
              <PdfViewer key={detail.id} reportId={detail.id} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
