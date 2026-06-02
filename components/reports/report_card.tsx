"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Calendar, User } from "lucide-react";
import { ReportPdfViewer } from "./report_pdf_viewer";
import type { ReportListResponse } from "@/services/reports";
import { fetchReportPdfBlob } from "@/services/reports";

interface ReportCardProps {
  report: ReportListResponse;
  showEmployee?: boolean;
}

const GRADE_COLORS: Record<string, string> = {
  Exceptional: "bg-green-500/10 text-green-600 border-green-500/20",
  "Above Expectations": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Meets Expectations": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  "Below Expectations": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Unsatisfactory: "bg-red-500/10 text-red-600 border-red-500/20",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ReportCard({ report, showEmployee = true }: ReportCardProps) {
  const [pdfOpen, setPdfOpen] = useState(false);

  async function handleDownload() {
    const blob = await fetchReportPdfBlob(report.id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${report.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const gradeClass = GRADE_COLORS[report.overall_grade] ?? "bg-muted text-muted-foreground";
  const periodLabel = report.period_type === "annual" ? "Annual" : "Semi-Annual";

  return (
    <>
      <Card className="border bg-card/80 hover:bg-card transition-colors">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            {/* Icon */}
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{report.title}</h3>
                <Badge variant="outline" className="text-xs capitalize shrink-0">
                  {periodLabel}
                </Badge>
                <Badge className={`text-xs border shrink-0 ${gradeClass}`}>
                  {report.overall_grade}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {showEmployee && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {report.employee_name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(report.period_start)} – {formatDate(report.period_end)}
                </span>
                <span>By {report.created_by_name}</span>
                <span>{formatDate(report.created_at)}</span>
              </div>

              <div className="mt-2 flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Rating:</span>
                <span className="text-xs font-semibold">{report.overall_rating.toFixed(1)}/5.0</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setPdfOpen(true)}>
                <Eye className="h-3.5 w-3.5" />
                View
              </Button>
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={handleDownload}>
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ReportPdfViewer
        reportId={report.id}
        reportTitle={report.title}
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
      />
    </>
  );
}
