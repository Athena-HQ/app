import { Card } from "@/components/ui/card";
import { TaskStatusBadge } from "./task_status_badge";
import { Badge } from "@/components/ui/badge";
import type { TaskListResponse, TaskPriority } from "@/services/task";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { User, Users } from "lucide-react";

type TaskCardProps = {
  task: TaskListResponse;
};

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-blue-500/10 text-blue-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
};

export function TaskCard({ task }: TaskCardProps) {
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== "completed" &&
    task.status !== "under_review";

  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between gap-4 flex-1">
          <div className="flex-1 min-w-0 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-sm truncate">{task.title}</h3>
              <TaskStatusBadge status={task.status} />
            </div>
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <Badge className={cn("text-xs", priorityColors[task.priority])}>
                {task.priority}
              </Badge>
              <span className="text-xs text-muted-foreground">{task.category}</span>
              {task.due_date && (
                <span
                  className={cn(
                    "text-xs",
                    isOverdue && "text-destructive font-medium"
                  )}
                >
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="mt-auto pt-3">
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                {(task.assigned_to_name || (task.squads && task.squads.length > 0)) && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Assignee:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {task.assigned_to_name && task.assigned_to_name.split(', ').map((name, i) => (
                        <span key={i} className="flex items-center gap-1 bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded-md border border-sky-500/20">
                          <User className="h-3 w-3" />
                          {name}
                        </span>
                      ))}
                      {task.squads && task.squads.map((squad, i) => (
                        <span key={squad.id || i} className="flex items-center gap-1 bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded-md border border-purple-500/20">
                          <Users className="h-3 w-3" />
                          {squad.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {task.assigned_by_name && (
                  <div className="flex items-center gap-1.5 ml-auto">
                      <span>Assigned by: {task.assigned_by_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

