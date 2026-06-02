"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, X, FileText } from "lucide-react";
import { fetchReportPdfBlob, getReportPdfDownloadUrl } from "@/services/reports";
import { getAccessToken } from "@/lib/auth/token-store";
import { getApiBaseUrl } from "@/lib/api/api-util";

interface ReportPdfViewerProps {
  reportId: number;
  reportTitle: string;
  open: boolean;
  onClose: () => void;
}

export function ReportPdfViewer({ reportId, reportTitle, open, onClose }: ReportPdfViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    setError(null);

    fetchReportPdfBlob(reportId)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      })
      .catch(() => setError("Failed to load PDF. Please try again."))
      .finally(() => setIsLoading(false));

    return () => {
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [open, reportId]);

  async function handleDownload() {
    try {
      const blob = await fetchReportPdfBlob(reportId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${reportId}_${reportTitle.replace(/\s+/g, "_").slice(0, 40)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silently fail — user can retry
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="flex flex-row items-center justify-between px-5 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <DialogTitle className="text-base font-semibold truncate max-w-[480px]">
              {reportTitle}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-muted/30">
          {isLoading && (
            <div className="flex flex-col gap-3 p-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-64 w-full mt-4" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          {blobUrl && !isLoading && (
            <iframe
              src={blobUrl}
              className="w-full h-full border-0"
              title={reportTitle}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
