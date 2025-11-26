import { motion } from "framer-motion";
import { RadialBar, RadialBarChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSquadDistribution } from "@/hooks/useDashboard";
import { fadeInUpVariants } from "@/lib/animations-settings";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

export function SquadDistributionChart() {
  const { data: squadData, isLoading } = useSquadDistribution();

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  const total = squadData?.reduce((sum, squad) => sum + squad.value, 0) || 0;

  const chartData = squadData?.map((squad) => ({
    squad: squad.name.toLowerCase().replace(/\s+/g, '-'),
    label: squad.name,
    members: squad.value,
    fill: squad.color,
  })) || [];

  const chartConfig = squadData?.reduce((config, squad) => {
    const key = squad.name.toLowerCase().replace(/\s+/g, '-');
    config[key] = {
      label: squad.name,
      color: squad.color,
    };
    return config;
  }, {
    members: {
      label: "Members",
    },
  } as ChartConfig) || {};

  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="initial"
      animate="animate"
      transition={{ delay: 0.5 }}
    >
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Squad Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <RadialBarChart data={chartData} innerRadius={30} outerRadius={110}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent labelKey="label" />}
              />
              <RadialBar
                cornerRadius={10}
                dataKey="members"
                background
                className="drop-shadow-lg"
              />
            </RadialBarChart>
          </ChartContainer>
          <div className="text-center mt-4">
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
