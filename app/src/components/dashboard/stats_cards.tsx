import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/useDashboard";
import { fadeInUpVariants } from "@/lib/animations-settings";

export function StatsCards() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-10 w-20" />
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: "Number of Employees",
      value: stats?.employees || 0,
      format: (val: number) => val.toString(),
    },
    {
      label: "Task Velocity",
      value: stats?.taskVelocity || 0,
      format: (val: number) => `${val} days avg`,
    },
    {
      label: "Onboarding",
      value: stats?.onboarding || 0,
      format: (val: number) => `${val} Pending`,
    },
    {
      label: "Total XP",
      value: stats?.totalXP || 0,
      format: (val: number) => `${(val / 1000).toFixed(0)}k XP`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          variants={fadeInUpVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
            <p className="text-3xl font-semibold">{stat.format(stat.value)}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
