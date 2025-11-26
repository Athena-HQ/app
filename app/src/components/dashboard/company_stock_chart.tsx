import { motion, useMotionValueEvent, useSpring } from "framer-motion";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyStock } from "@/hooks/useDashboard";
import { fadeInUpVariants } from "@/lib/animations-settings";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { useRef, useState } from "react";

const chartConfig = {
  value: {
    label: "Stock Value",
    color: "#eab308",
  },
} satisfies ChartConfig;

export function CompanyStockChart() {
  const { data: stockData, isLoading } = useCompanyStock();
  const chartRef = useRef<HTMLDivElement>(null);
  const [axis, setAxis] = useState(0);

  const springX = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });
  const springY = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });

  useMotionValueEvent(springX, "change", (latest) => {
    setAxis(latest);
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  const lastValue = stockData?.[stockData.length - 1]?.value || 0;

  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="initial"
      animate="animate"
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            ${(springY.get() / 1000).toFixed(1)}k
            <Badge variant="secondary" className="ml-2">
              <TrendingUp className="h-4 w-4" />
              <span>+12.5%</span>
            </Badge>
          </CardTitle>
          <CardDescription>Company Stock Value (Last 12 Months)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            ref={chartRef}
            className="h-54 w-full"
            config={chartConfig}
          >
            <AreaChart
              className="overflow-visible"
              accessibilityLayer
              data={stockData}
              onMouseMove={(state: any) => {
                const x = state.activeCoordinate?.x;
                const dataValue = state.activePayload?.[0]?.value;
                if (x && dataValue !== undefined) {
                  springX.set(x);
                  springY.set(dataValue);
                }
              }}
              onMouseLeave={() => {
                springX.set(chartRef.current?.getBoundingClientRect().width || 0);
                springY.jump(lastValue);
              }}
              margin={{
                right: 0,
                left: 0,
              }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                horizontalCoordinatesGenerator={(props) => {
                  const { height } = props;
                  return [0, height - 30];
                }}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <Area
                dataKey="value"
                type="monotone"
                fill="url(#gradient-cliped-area-value)"
                fillOpacity={0.4}
                stroke="var(--color-value)"
                clipPath={`inset(0 ${
                  Number(chartRef.current?.getBoundingClientRect().width) - axis
                } 0 0)`}
              />
              <line
                x1={axis}
                y1={0}
                x2={axis}
                y2={"85%"}
                stroke="var(--color-value)"
                strokeDasharray="3 3"
                strokeLinecap="round"
                strokeOpacity={0.2}
              />
              <rect
                x={axis - 50}
                y={0}
                width={50}
                height={18}
                fill="var(--color-value)"
              />
              <text
                x={axis - 25}
                fontWeight={600}
                y={13}
                textAnchor="middle"
                fill="var(--primary-foreground)"
              >
                ${(springY.get() / 1000).toFixed(1)}k
              </text>
              <Area
                dataKey="value"
                type="monotone"
                fill="none"
                stroke="var(--color-value)"
                strokeOpacity={0.1}
              />
              <defs>
                <linearGradient
                  id="gradient-cliped-area-value"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-value)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-value)"
                    stopOpacity={0}
                  />
                  <mask id="mask-cliped-area-chart">
                    <rect
                      x={0}
                      y={0}
                      width={"50%"}
                      height={"100%"}
                      fill="white"
                    />
                  </mask>
                </linearGradient>
              </defs>
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
