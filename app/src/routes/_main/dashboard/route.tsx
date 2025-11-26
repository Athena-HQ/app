import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { fadeInVariants } from "@/lib/animations-settings";
import { StatsCards } from "@/components/dashboard/stats_cards";
import { CompanyStockChart } from "@/components/dashboard/company_stock_chart";
import { SquadDistributionChart } from "@/components/dashboard/squad_distribution_chart";
import { RecentActivity } from "@/components/dashboard/recent_activity";
import { TopPerformers } from "@/components/dashboard/top_performers";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

export const Route = createFileRoute("/_main/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="p-8">
      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        className="max-w-[1600px] mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Overview</h1>
          <div className="relative w-80">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Global Search..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-6">
          <StatsCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CompanyStockChart />
            </div>
            <div>
              <SquadDistributionChart />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity />
            <TopPerformers />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
