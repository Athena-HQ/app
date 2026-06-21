import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { TaskCompletionData } from "@/services/dashboard";
import { TrendingUp } from "lucide-react";

interface TaskCompletionGraphProps {
  threeMonths: TaskCompletionData[];
  sixMonths: TaskCompletionData[];
  twelveMonths: TaskCompletionData[];
}

export function TaskCompletionGraph({
  threeMonths,
  sixMonths,
  twelveMonths,
}: TaskCompletionGraphProps) {
  const [selectedRange, setSelectedRange] = useState<"3" | "6" | "12">("3");

  const data =
    selectedRange === "3"
      ? threeMonths
      : selectedRange === "6"
      ? sixMonths
      : twelveMonths;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatXAxisLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (selectedRange === "3") {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (selectedRange === "6") {
      return date.toLocaleDateString("en-US", { month: "short" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }
  };

  const totalCompleted = data.reduce((sum, item) => sum + item.count, 0);
  const averagePerDay = data.length > 0 ? totalCompleted / data.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-2 h-full min-h-[500px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Your Progress
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track your task completion and productivity trends
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedRange === "3" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRange("3")}
              >
                3M
              </Button>
              <Button
                variant={selectedRange === "6" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRange("6")}
              >
                6M
              </Button>
              <Button
                variant={selectedRange === "12" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRange("12")}
              >
                12M
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Total Completed</p>
              <p className="text-3xl font-bold">{totalCompleted}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground mb-1">Avg per Day</p>
              <p className="text-3xl font-bold">
                {averagePerDay.toFixed(1)}
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxisLabel}
                className="text-xs"
                interval={0}
                minTickGap={16}
              />
              <YAxis className="text-xs" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length && payload[0]?.payload) {
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="text-sm font-medium">
                          {formatDate(payload[0].payload.date)}
                        </p>
                        <p className="text-lg font-bold text-primary">
                          {payload[0].payload.count} task{payload[0].payload.count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTasks)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}

