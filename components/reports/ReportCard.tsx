import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Star, Calendar, User } from "lucide-react";
import { GRADE_COLORS, type ReportListItem } from "@/services/reports";

interface ReportCardProps {
  report: ReportListItem;
  onView: (report: ReportListItem) => void;
}

export function ReportCard({ report, onView }: ReportCardProps) {
  const gradeClass = GRADE_COLORS[report.overall_grade] ?? "text-gray-600 bg-gray-50 border-gray-200";
  const periodLabel = report.period_type === "annual" ? "Annual" : "Semi-Annual";

  return (
    <Card
      className="border border-border/60 bg-card/80 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onView(report)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">{report.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                by {report.created_by_name}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={`shrink-0 text-[11px] border ${gradeClass}`}>
            {report.overall_grade}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {report.employee_name}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {report.period_start} → {report.period_end}
          </span>
          <Badge variant="secondary" className="text-[10px] h-5">{periodLabel}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold">{report.overall_rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">/ 5</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={(e) => { e.stopPropagation(); onView(report); }}
          >
            View Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
