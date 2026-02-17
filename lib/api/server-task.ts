import { cookies } from "next/headers";
import { getApiBaseUrl } from "@/lib/api/api-util";
import type { TaskResponse } from "@/services/task";

function buildTaskUrl(taskId: string): string {
  const base = getApiBaseUrl().replace(/\/$/, "");
  return `${base}/tasks/${encodeURIComponent(taskId)}/`;
}

export async function getTaskServer(taskId: string): Promise<TaskResponse | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const response = await fetch(buildTaskUrl(taskId), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    cache: "no-store",
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to fetch task ${taskId}: ${response.status}`);
  }

  return (await response.json()) as TaskResponse;
}
