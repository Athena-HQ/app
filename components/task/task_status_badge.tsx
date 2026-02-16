import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/services/task";
import { cn } from "@/lib/utils";

type TaskStatusBadgeProps = {
  status: TaskStatus;
  className?: string;
};

const statusConfig: Record<TaskStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" }> = {
  assigned: { label: "Assigned", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "default" },
  completed: { label: "Completed", variant: "success" },
  under_review: { label: "Under Review", variant: "warning" },
  on_hold: { label: "On Hold", variant: "secondary" },
};

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={cn("text-xs", className)}>
      {config.label}
    </Badge>
  );
}

