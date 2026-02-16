"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, ListTodo, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { fadeInVariants } from "@/lib/animations-settings";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { useMySquad } from "@/hooks/useMySquad";
import { TaskStatusBadge } from "@/components/task/task_status_badge";
import type { TaskListResponse } from "@/services/task";

export default function MySquadPage() {
  const router = useRouter();
  const { canSeeMySquad, isLoading: roleLoading } = useCurrentUserRole();
  const { squad, tasks, mySquadsCount, isLoading: dataLoading, isEmpty } = useMySquad();

  useEffect(() => {
    if (!roleLoading && !canSeeMySquad) {
      router.replace("/dashboard");
    }
  }, [canSeeMySquad, roleLoading, router]);

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!canSeeMySquad) {
    return null;
  }

  if (dataLoading && !squad) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
        Loading your squad...
      </div>
    );
  }

  if (isEmpty) {
    return (
      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-4 w-full"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">My Squad</h1>
          <p className="text-muted-foreground">
            You are not in a squad yet. Ask your manager to add you to a squad.
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">No squad assigned</p>
            <Link href="/squads">
              <Button variant="outline">View all squads</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const techStack = squad?.stack
    ? squad.stack.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const leaderName =
    squad?.leader?.first_name != null && squad?.leader?.last_name != null
      ? `${squad.leader.first_name} ${squad.leader.last_name}`.trim()
      : squad?.leader?.email ?? "—";

  return (
    <motion.div
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-6 w-full"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">My Squad</h1>
        <p className="text-muted-foreground">
          Your squad details, members, and current tasks.
        </p>
        {mySquadsCount > 1 && (
          <p className="text-sm text-muted-foreground">
            Showing your first squad.{" "}
            <Link href="/squads" className="text-primary underline">
              View all squads
            </Link>
          </p>
        )}
      </div>

      {squad && (
        <>
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-xl">{squad.name}</CardTitle>
                <Badge
                  variant="outline"
                  className={
                    squad.is_active
                      ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {squad.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              {squad.project_name && (
                <p className="text-sm text-muted-foreground">
                  {squad.project_name}
                </p>
              )}
              {squad.description && (
                <p className="text-sm text-foreground/90 mt-1">
                  {squad.description}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {techStack.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="font-normal"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Lead: {leaderName}
              </p>
            </CardHeader>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members ({squad.members?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {squad.members && squad.members.length > 0 ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {squad.members.map((member) => {
                    const name =
                      member.app_user?.first_name != null &&
                      member.app_user?.last_name != null
                        ? `${member.app_user.first_name} ${member.app_user.last_name}`.trim()
                        : member.app_user?.email ?? "—";
                    const initial = (name.charAt(0) || "?").toUpperCase();
                    return (
                      <li
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-background/50"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{initial}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {member.role_in_squad || "Member"}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No members in this squad.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                Current tasks ({tasks.length})
              </CardTitle>
              <Link href="/tasks">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all tasks
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <ul className="space-y-2">
                  {tasks.map((task: TaskListResponse) => (
                    <li key={task.id}>
                      <Link
                        href="/tasks"
                        className="flex flex-wrap items-center gap-2 p-3 rounded-lg border bg-background/50 hover:bg-accent/50 transition-colors"
                      >
                        <span className="font-medium truncate flex-1 min-w-0">
                          {task.title}
                        </span>
                        <TaskStatusBadge status={task.status} />
                        {task.assigned_to_name && (
                          <span className="text-xs text-muted-foreground truncate">
                            {task.assigned_to_name}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tasks assigned to this squad yet.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
}
