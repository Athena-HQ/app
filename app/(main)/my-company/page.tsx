"use client";

import { motion } from "framer-motion";
import { fadeInVariants } from "@/lib/animations-settings";
import { useCompanyHierarchy } from "@/hooks/useCompanyHierarchy";
import {
  CompanyHierarchy,
  CompanyHierarchyEmpty,
  CompanyHierarchyError,
  CompanyHierarchyLoading,
} from "@/components/company/company_hierarchy";

export default function MyCompanyPage() {
  const { data, isLoading, error, refetch } = useCompanyHierarchy();

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6 w-full pb-8"
    >
      {isLoading ? <CompanyHierarchyLoading /> : null}
      {!isLoading && error ? <CompanyHierarchyError onRetry={() => void refetch()} /> : null}
      {!isLoading && !error && data.counts.total === 0 ? <CompanyHierarchyEmpty /> : null}
      {!isLoading && !error && data.counts.total > 0 ? <CompanyHierarchy data={data} /> : null}
    </motion.div>
  );
}
