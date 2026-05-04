"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { taskFormSchema, type TaskFormValues } from "@/lib/validations/task";
import {
  taskService,
  type TaskPriority,
  type TaskCategory,
  type TaskResponse,
} from "@/services/task";
import { useMutation } from "@tanstack/react-query";
import { useTask } from "./useTasks";
import { toast } from "sonner";
import { useCurrentAppUser } from "./useCurrentAppUser";
import { ApiError } from "@/lib/api/api-util";
import { useTaskRelatedInvalidation } from "./useTaskRelatedInvalidation";

const defaultValues: TaskFormValues = {
  title: "",
  description: "",
  assigneeIds: [],
  priority: "medium",
  category: "feature",
  dueDate: "",
  squadIds: [],
};

export function useTaskForm(taskId?: string) {
  const router = useRouter();
  const { appUser, isMissingEmployee } = useCurrentAppUser();
  const { data: task } = useTask(taskId);
  const { invalidateAfterTaskMutation } = useTaskRelatedInvalidation();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (data: TaskFormValues) =>
      taskService.createTask({
        title: data.title,
        description: data.description,
        assignee_ids: data.assigneeIds.map(id => parseInt(id, 10)),
        priority: data.priority as TaskPriority,
        category: data.category as TaskCategory,
        due_date: data.dueDate ? data.dueDate : null,
        squad_ids: data.squadIds.map(id => parseInt(id, 10)),
      }),
    onSuccess: async (createdTask: TaskResponse) => {
      await invalidateAfterTaskMutation(String(createdTask.id));
      toast.success("Task created successfully");
      router.push("/tasks");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message || "Failed to create task");
        return;
      }
      toast.error("Failed to create task");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TaskFormValues) => {
      if (!taskId) throw new Error("Task ID is required");
      return taskService.updateTask(taskId, {
        priority: data.priority as TaskPriority,
        category: data.category as TaskCategory,
        due_date: data.dueDate ? data.dueDate : null,
        assignee_ids: data.assigneeIds.map(id => parseInt(id, 10)),
        squad_ids: data.squadIds.map(id => parseInt(id, 10)),
      });
    },
    onSuccess: async () => {
      await invalidateAfterTaskMutation(taskId);
      toast.success("Task updated successfully");
      router.push("/tasks");
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description,
        assigneeIds: task.assignees ? task.assignees.map(a => String(a.id)) : [],
        priority: task.priority,
        category: task.category,
        dueDate: task.due_date ?? "",
        squadIds: task.squads ? task.squads.map(s => String(s.id)) : [],
      });
    }
  }, [task, form]);

  const onSubmit = (data: TaskFormValues) => {
    if (!appUser || isMissingEmployee) {
      toast.error(
        "Could not resolve your employee profile. Please contact your administrator."
      );
      return;
    }

    if (taskId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isCurrentUserReady: Boolean(appUser) && !isMissingEmployee,
  };
}
