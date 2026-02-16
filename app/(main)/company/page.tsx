"use client";

import { motion } from "framer-motion";
import { fadeInVariants } from "@/lib/animations-settings";
import { useCompanyOrgData } from "@/hooks/useCompanyOrgData";
import { CompanyHeader } from "@/components/company/company_header";
import { CompanyOrgChart } from "@/components/company/company_org_chart";

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="h-6 w-48 rounded bg-muted" />
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="flex flex-col gap-4">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg border bg-muted/50" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="h-3 w-28 rounded bg-muted" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-lg border bg-muted/50" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CompanyPage() {
  const { company, tiers, employees, isLoading, isError } = useCompanyOrgData();

  if (isLoading) {
    return (
      <div className="w-full">
        <LoadingSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[280px] text-center px-4">
        <p className="text-muted-foreground">
          Only company managers can view the organization.
        </p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-4 w-full"
      >
        <h1 className="font-serif text-3xl font-semibold">My Company</h1>
        <div className="flex flex-col items-center justify-center min-h-[200px] rounded-lg border border-dashed bg-muted/20 text-center px-4">
          <p className="font-medium text-muted-foreground">No employees yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite team members to get started.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6 w-full"
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl font-semibold">My Company</h1>
        <CompanyHeader company={company} />
      </div>
      <CompanyOrgChart tiers={tiers} />
    </motion.div>
  );
}
