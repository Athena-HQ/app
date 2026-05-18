import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { TaskStatus } from "@/services/task";
import {
  PlayCircle,
  CheckCircle2,
  Circle,
  PauseCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskStatCardProps {
  title: string;
  count: number;
  status?: TaskStatus;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
}

export function TaskStatCard({
  title,
  count,
  status,
  icon,
  gradient,
  delay = 0,
}: TaskStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      <Link
        href={status ? `/tasks?status=${status}` : "/tasks"}
        className="block h-full"
      >
        <Card
          className={cn(
            "relative overflow-hidden border-2 h-full min-h-[180px] cursor-pointer transition-all hover:shadow-lg group",
            gradient
          )}
        >
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-muted-foreground/80 uppercase tracking-wide">
                  {title}
                </p>
                <p className="text-6xl font-bold">{count}</p>
              </div>
              <div className="p-3 rounded-full bg-background/20 backdrop-blur-sm group-hover:bg-background/30 transition-colors">
                {icon}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>View Tasks</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export function TaskStatCards({
  inProgress,
  todo,
  done,
  onHold,
}: {
  inProgress: number;
  todo: number;
  done: number;
  onHold: number;
}) {
  return (
    <>
      <TaskStatCard
        title="In Progress"
        count={inProgress}
        status="in_progress"
        icon={<PlayCircle className="h-8 w-8 text-blue-600" />}
        gradient="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30"
        delay={0.1}
      />
      <TaskStatCard
        title="To Do"
        count={todo}
        status="assigned"
        icon={<Circle className="h-8 w-8 text-amber-600" />}
        gradient="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30"
        delay={0.2}
      />
      <TaskStatCard
        title="Done"
        count={done}
        status="completed"
        icon={<CheckCircle2 className="h-8 w-8 text-green-600" />}
        gradient="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30"
        delay={0.3}
      />
      <TaskStatCard
        title="On Hold"
        count={onHold}
        status="on_hold"
        icon={<PauseCircle className="h-8 w-8 text-red-600" />}
        gradient="bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30"
        delay={0.4}
      />
    </>
  );
}
