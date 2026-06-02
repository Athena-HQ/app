"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportCard } from "@/components/reports/report_card";
import { ReportCreateDialog } from "@/components/reports/report_create_dialog";
import { listReports, type ReportFilters } from "@/services/reports";
import { queryKeys } from "@/lib/query-keys";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { fadeInVariants } from "@/lib/animations-settings";
import { FileText, Plus, Filter } from "lucide-react";

// Roles that can CREATE reports
const CREATOR_ROLES = ["company manager", "ceo", "cto", "hr"];
// Roles that can RECEIVE reports (everyone except company manager)
const RECEIVER_ROLES = ["ceo", "cto", "hr", "senior engineer", "junior engineer"];

function normalizeRole(role: string | null | undefined) {
  return (role ?? "").toLowerCase().trim();
}

function canCreate(role: string | null | undefined) {
  return CREATOR_ROLES.includes(normalizeRole(role));
}

function canReceive(role: string | null | undefined) {
  return RECEIVER_ROLES.includes(normalizeRole(role));
}

function getSubtitle(role: string | null | undefined) {
  const r = normalizeRole(role);
  if (r === "company manager") return "Performance reviews you've issued for your team.";
  if (CREATOR_ROLES.includes(r))
    return "Performance reviews across your company — create one or check your own.";
  return "Your performance reviews issued by your superiors — check back here once one is submitted.";
}

function getEmptyMessage(role: string | null | undefined, byMe: boolean) {
  const r = normalizeRole(role);
  if (r === "company manager") return "You haven't issued any reports yet.";
  if (CREATOR_ROLES.includes(r))
    return byMe ? "You haven't created any reports yet." : "No reports have been created in your company yet.";
  return "No reports have been issued for you yet. Your superiors will submit one here when it's time.";
}

export default function ReportsPage() {
  const { appUser, isLoading: isUserLoading } = useCurrentAppUser();
  const role = appUser?.role ?? null;

  const creator = canCreate(role);
  const receiver = canReceive(role);
  // company manager is creator-only → always show by_me view
  const creatorOnly = creator && !receiver;

  const [byMe, setByMe] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // company managers always get by_me filter; other creators can toggle
  const filters: ReportFilters = creatorOnly || (creator && byMe) ? { filter: "by_me" } : {};

  const { data: reports = [], isLoading: isReportsLoading } = useQuery({
    queryKey: queryKeys.reports.list(filters),
    queryFn: () => listReports(filters),
    enabled: !isUserLoading && !!appUser,
  });

  const isLoading = isUserLoading || isReportsLoading;

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6 w-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Reports</h1>
          {isUserLoading ? (
            <Skeleton className="h-4 w-64" />
          ) : (
            <p className="text-muted-foreground text-sm">{getSubtitle(role)}</p>
          )}
        </div>

        {/* Create button — shown once user is loaded and is a creator */}
        {!isUserLoading && creator && (
          <Button className="gap-2 shrink-0" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Report
          </Button>
        )}
      </div>

      {/* Filter tabs — only for creators who can also receive (ceo / cto / hr) */}
      {!isUserLoading && creator && !creatorOnly && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={!byMe ? "default" : "secondary"}
            size="sm"
            onClick={() => setByMe(false)}
          >
            All Reports
          </Button>
          <Button
            variant={byMe ? "default" : "secondary"}
            size="sm"
            className="gap-2"
            onClick={() => setByMe(true)}
          >
            <Filter className="h-3.5 w-3.5" />
            Created by Me
          </Button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 py-16 text-center gap-3">
          <div className="h-12 w-12 rounded-full bg-muted/40 flex items-center justify-center">
            <FileText className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            {getEmptyMessage(role, byMe)}
          </p>
          {creator && (
            <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
              Create the first one
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              showEmployee={creator}
            />
          ))}
        </div>
      )}

      {creator && (
        <ReportCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      )}
    </motion.div>
  );
}
