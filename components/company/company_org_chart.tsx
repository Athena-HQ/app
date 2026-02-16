"use client";

import { motion, Variants } from "framer-motion";
import { EmployeeCard } from "./employee_card";
import type { HierarchyTier } from "@/lib/company_hierarchy";

interface CompanyOrgChartProps {
  tiers: HierarchyTier[];
}

const tierVariants = {
  initial: { opacity: 0, y: 16 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" },
  }),
};

export function CompanyOrgChart({ tiers }: CompanyOrgChartProps) {
  return (
    <div className="flex flex-col gap-8">
      {tiers.map((tier, i) => (
        <motion.section
          key={tier.level}
          variants={tierVariants as Variants}
          initial="initial"
          animate="animate"
          custom={i}
          className="flex flex-col gap-3"
        >
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-sans">
            {tier.label}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
            {tier.employees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                roleLabel={tier.label}
              />
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
