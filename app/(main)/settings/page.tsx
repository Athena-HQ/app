"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

import { fadeInVariants } from "@/lib/animations-settings";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { useCompanyOrgData } from "@/hooks/useCompanyOrgData";
import { Badge } from "@/components/ui/badge";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { CompanyInfoTab } from "@/components/settings/CompanyInfoTab";
import { ProfileTab } from "@/components/settings/ProfileTab";

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse w-full max-w-[1180px]">
      <div className="pt-8 pb-6 border-b border-border/70">
        <div className="h-4 w-32 rounded bg-muted mb-3" />
        <div className="h-12 w-48 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <div className="h-36 rounded-lg bg-muted/50" />
        <div className="h-[500px] rounded-xl bg-muted/50" />
      </div>
    </div>
  );
}

// Separated so the Suspense boundary wraps only the searchParams consumer
function SettingsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isCompanyManager, isLoading: roleLoading } = useCurrentUserRole();
  const { appUser, isLoading: userLoading } = useCurrentAppUser();
  const { company, employees, isLoading: companyLoading } = useCompanyOrgData();

  const visibleTab = isCompanyManager ? "company" : "profile";

  // Keep ?tab= in sync with the role-derived tab
  useEffect(() => {
    if (roleLoading) return;
    const current = searchParams.get("tab");
    if (current !== visibleTab) {
      router.replace(`/settings?tab=${visibleTab}`);
    }
  }, [visibleTab, roleLoading, searchParams, router]);

  if (roleLoading || userLoading || (isCompanyManager && companyLoading)) {
    return <LoadingSkeleton />;
  }

  if (!isCompanyManager && !appUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[280px] text-center px-4">
        <p className="text-muted-foreground">
          Could not load your profile. Please refresh the page.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="max-w-[1180px] w-full pb-8"
    >
      <header className="pt-8 pb-6 flex items-end justify-between gap-4 flex-wrap border-b border-border/70">
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium">
            Account &amp; workspace
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight">
            Settings
          </h1>
        </div>
        <Badge variant="secondary" className="h-7 px-2.5 gap-1.5 text-[11px]">
          <Info size={12} />
          Changes sync across squads in real-time
        </Badge>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 py-6">
        <SettingsTabs visibleTab={visibleTab} />

        <section className="min-w-0">
          {isCompanyManager && company ? (
            <CompanyInfoTab company={company} employees={employees} />
          ) : appUser ? (
            <ProfileTab appUser={appUser} />
          ) : null}
        </section>
      </div>
    </motion.div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <SettingsInner />
    </Suspense>
  );
}
