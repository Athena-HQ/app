import { TaskDetailPageClient } from "@/components/task/task_detail_page_client";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  return <TaskDetailPageClient taskId={taskId} />;
}
