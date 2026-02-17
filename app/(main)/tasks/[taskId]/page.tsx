import { notFound } from "next/navigation";
import { TaskDetailPageClient } from "@/components/task/task_detail_page_client";
import { getTaskServer } from "@/lib/api/server-task";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const initialTask = await getTaskServer(taskId);
  if (!initialTask) notFound();

  return <TaskDetailPageClient taskId={taskId} initialTask={initialTask} />;
}
