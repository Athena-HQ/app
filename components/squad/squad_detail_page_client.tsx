"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Edit, Users, Code, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TaskTable } from "@/components/task/task_table";
import { getSquad, type SquadResponse } from "@/services/squad";
import { getSquadTasks, type TaskListResponse } from "@/services/task";
import { queryKeys } from "@/lib/query-keys";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";

type SquadDetailPageClientProps = {
  squadId: string;
};

export default function SquadDetailPageClient({
  squadId,
}: SquadDetailPageClientProps) {
  const numericId = parseInt(squadId, 10);
  const { appUser } = useCurrentAppUser();

  const { data: squad, isLoading: isSquadLoading } = useQuery<SquadResponse>({
    queryKey: queryKeys.squads.detail(squadId),
    queryFn: () => getSquad(numericId),
    enabled: !isNaN(numericId),
  });

  const { data: tasks = [], isLoading: isTasksLoading } = useQuery<
    TaskListResponse[]
  >({
    queryKey: queryKeys.squads.tasks(squadId),
    queryFn: () => getSquadTasks(numericId),
    enabled: !isNaN(numericId),
  });

  if (isSquadLoading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!squad) {
    return (
      <div className="flex flex-col gap-6 w-full items-center justify-center py-16">
        <p className="text-muted-foreground">Squad not found</p>
        <Button asChild variant="outline">
          <Link href="/squads">Back to Squads</Link>
        </Button>
      </div>
    );
  }

  const techStack = squad.stack
    ? squad.stack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const isSquadLead = squad.squad_lead?.id === appUser?.id;
  const isManagement = ['company manager', 'ceo', 'cto', 'hr'].includes(appUser?.role || '');
  const canEdit = isSquadLead || isManagement;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/squads">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to squads</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{squad.name}</h1>
          {squad.description && (
            <p className="text-muted-foreground mt-1">{squad.description}</p>
          )}
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href={`/squads/${squad.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Squad
          </Link>
        </Button>
      </div>

      {/* Squad Info Card */}
      <Card className="border-none shadow-card bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Squad Members</p>
                <p className="text-lg font-semibold">{squad.member_count}</p>
              </div>
            </div>
            {squad.squad_lead && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-background shadow-sm">
                  <AvatarFallback>
                    {squad.squad_lead.first_name?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <span className="text-muted-foreground">Lead: </span>
                  <span className="font-medium">
                    {squad.squad_lead.first_name} {squad.squad_lead.last_name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {techStack.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Code className="h-4 w-4 text-muted-foreground" />
              {techStack.map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="text-xs"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          )}

          {squad.members && squad.members.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Team Members
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {squad.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 rounded-md border bg-muted/30 p-2"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">
                          {member.app_user?.first_name?.charAt(0) ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.app_user?.first_name ?? ""}{" "}
                          {member.app_user?.last_name ?? ""}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {member.role_in_squad?.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tasks Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Squad Tasks</h2>
          {tasks.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {tasks.length}
            </Badge>
          )}
        </div>
        <TaskTable tasks={tasks} isLoading={isTasksLoading} />
      </div>
    </motion.div>
  );
}
