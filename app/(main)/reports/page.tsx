"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Loader2 } from "lucide-react";
import { listReports, type ReportListItem } from "@/services/reports";
import { ReportCard } from "@/components/reports/ReportCard";
import { ReportDetailDialog } from "@/components/reports/ReportDetailDialog";
import { CreateReportSheet } from "@/components/reports/CreateReportSheet";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";

export default function ReportsPage() {
  const [selected, setSelected] = useState<ReportListItem | null>(null);
  const { isSuperior, isLoading: roleLoading } = useCurrentUserRole();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => listReports(),
    enabled: !roleLoading,
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSuperior
              ? "Performance reports for your team"
              : "Your performance reports"}
          </p>
        </div>
        {isSuperior && <CreateReportSheet />}
      </div>

      {/* Content */}
      {isLoading || roleLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading reports…
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <FileText className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-base font-medium">No reports yet</p>
          {isSuperior && (
            <p className="text-sm mt-1">Create the first report for your team.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} onView={setSelected} />
          ))}
        </div>
      )}

      <ReportDetailDialog
        report={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
