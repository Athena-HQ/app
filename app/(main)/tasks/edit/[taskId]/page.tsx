import { notFound } from "next/navigation";
import { TaskEditPageClient } from "@/components/task/task_edit_page_client";
import { getTaskServer } from "@/lib/api/server-task";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const initialTask = await getTaskServer(taskId);
  if (!initialTask) notFound();

  return <TaskEditPageClient taskId={taskId} initialTask={initialTask} />;
}
