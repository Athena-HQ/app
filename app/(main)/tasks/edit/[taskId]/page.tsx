import { TaskEditPageClient } from "@/components/task/task_edit_page_client";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  return <TaskEditPageClient taskId={taskId} />;
}
