import * as React from "react";
import { Button } from "@/components/ui/button";
import { TaskStatusSelector } from "./task_status_selector";
import { TaskStatusBadge } from "./task_status_badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Frame, FramePanel } from "@/components/ui/frame";
import type { TaskResponse, TaskPriority, SubtaskResponse } from "@/services/task";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";
import { useTaskStatusUpdate } from "@/hooks/useTaskStatusUpdate";
import { SubtaskForm } from "./subtask_form";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Users,
  Calendar,
  Clock,
  Flag,
  Tag,
  Edit,
  FileText,
  CheckCircle2,
  AlertCircle,
  GitBranch,
} from "lucide-react";

function appUserDisplayName(user: { first_name?: string; last_name?: string; role?: string | null } | null | undefined): string {
  if (!user) return "—";
  const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  return name || "—";
}

type TaskDetailsProps = {
  task: TaskResponse;
};

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-blue-500/10 text-blue-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
};

function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return "just now";
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

export function TaskDetails({ task }: TaskDetailsProps) {
  const { appUser } = useCurrentAppUser();
  const assigneeName = appUserDisplayName(task.assigned_to);
  const assignerName = appUserDisplayName(task.assigned_by);
  const statusUpdate = useTaskStatusUpdate();
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== "completed" &&
    task.status !== "under_review";
  const assignerId = task.assigned_by ? String(task.assigned_by.id) : "";
  const assigneeId = task.assigned_to ? String(task.assigned_to.id) : "";
  const currentUserId = appUser ? String(appUser.id) : "";
  const canEdit = assignerId === currentUserId;
  const canUpdateStatus =
    assigneeId === currentUserId || assignerId === currentUserId;
  const needsReview =
    task.status === "completed" && assignerId === currentUserId;

  // Determine if user can create subtasks
  // (assigner, assignee, or squad member — backend enforces, frontend just shows/hides button)
  const canCreateSubtask =
    assignerId === currentUserId ||
    assigneeId === currentUserId ||
    Boolean(task.squad); // If squad assigned, show button (backend checks membership)

  const handleStatusChange = (newStatus: TaskResponse["status"]) => {
    statusUpdate.mutate({ taskId: String(task.id), status: newStatus });
  };

  const handleMarkAsReviewed = () => {
    statusUpdate.mutate({ taskId: String(task.id), status: "under_review" });
  };

  const subtasks: SubtaskResponse[] = task.subtasks ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tasks">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to tasks</span>
          </Link>
        </Button>
        <div className="flex-1" />
        {canEdit && (
          <Button asChild variant="secondary" size="sm">
            <Link href={`/tasks/edit/${task.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Task
            </Link>
          </Button>
        )}
      </div>

      <Frame>
        <FramePanel>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-4">{task.title}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <TaskStatusBadge status={task.status} />
                  <Badge className={cn("text-xs capitalize", priorityColors[task.priority])}>
                    <Flag className="h-3 w-3 mr-1" />
                    {task.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    <Tag className="h-3 w-3 mr-1" />
                    {task.category}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {needsReview && (
              <div className="rounded-lg border-2 border-warning/50 bg-warning/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">
                          Review Required
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          This task has been completed and is awaiting your review.
                        </p>
                      </div>
                      <Button
                        onClick={handleMarkAsReviewed}
                        disabled={statusUpdate.isPending}
                        size="sm"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {statusUpdate.isPending ? "Marking..." : "Mark as Reviewed"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Description</h2>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Squad Assignment */}
                  {task.squad_name && (
                    <MetadataItem icon={Users} label="Squad">
                      <Badge className="text-xs bg-purple-500/15 text-purple-400 border-purple-500/25 w-fit">
                        <Users className="h-3 w-3 mr-1" />
                        {task.squad_name}
                      </Badge>
                    </MetadataItem>
                  )}

                  {/* Individual Assignment */}
                  <MetadataItem icon={User} label="Assignee">
                    {task.assigned_to ? (
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs bg-sky-500/15 text-sky-400 border-sky-500/25 w-fit">
                          <User className="h-3 w-3 mr-1" />
                          {assigneeName}
                        </Badge>
                        {task.assigned_to.role && (
                          <span className="text-xs text-muted-foreground">
                            · {task.assigned_to.role}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </MetadataItem>

                  <MetadataItem
                    icon={User}
                    label="Assigned By"
                    value={task.assigned_by ? `${assignerName}${task.assigned_by.role ? ` · ${task.assigned_by.role}` : ""}` : undefined}
                  />

                  <MetadataItem icon={Flag} label="Status">
                    {canUpdateStatus ? (
                      <div className="flex items-center gap-3">
                        <TaskStatusSelector
                          value={task.status}
                          onValueChange={handleStatusChange}
                          disabled={statusUpdate.isPending}
                        />
                        {statusUpdate.isPending && (
                          <span className="text-xs text-muted-foreground">
                            Updating...
                          </span>
                        )}
                      </div>
                    ) : (
                      <TaskStatusBadge status={task.status} />
                    )}
                  </MetadataItem>

                  {task.due_date && (
                    <MetadataItem icon={Calendar} label="Due Date">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            isOverdue && "text-destructive"
                          )}
                        >
                          {new Date(task.due_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        {isOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </MetadataItem>
                  )}

                  <MetadataItem icon={Clock} label="Created">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-foreground">
                        {new Date(task.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(task.created_at))}
                      </p>
                    </div>
                  </MetadataItem>

                  <MetadataItem icon={Clock} label="Last Updated">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-foreground">
                        {new Date(task.updated_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(task.updated_at))}
                      </p>
                    </div>
                  </MetadataItem>
                </div>
              </div>
            </div>

            {/* Subtasks Section */}
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Subtasks</h2>
                  {subtasks.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {subtasks.length}
                    </Badge>
                  )}
                </div>
                {canCreateSubtask && !task.parent_task && (
                  <SubtaskForm parentTaskId={task.id} />
                )}
              </div>

              {subtasks.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
                  <GitBranch className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No subtasks yet. Break this task down into smaller pieces.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <TaskStatusBadge status={subtask.status} />
                        <span className="text-sm font-medium truncate">
                          {subtask.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={cn("text-xs", priorityColors[subtask.priority])}>
                          {subtask.priority}
                        </Badge>
                        {subtask.assigned_to_name && (
                          <span className="text-xs text-muted-foreground">
                            {subtask.assigned_to_name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </FramePanel>
      </Frame>
    </div>
  );
}

function MetadataItem({
  icon: Icon,
  label,
  value,
  children,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        <Icon className="h-5 w-5 text-muted-foreground" size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
        {children || (
          <p className="text-sm font-medium text-foreground">{value || "—"}</p>
        )}
      </div>
    </div>
  );
}
