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
} from "@/services/task";
import { getCurrentUser } from "@/services/hierarchy";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTask } from "./useTasks";
import { toast } from "sonner";

const defaultValues: TaskFormValues = {
  title: "",
  description: "",
  assigneeId: "",
  priority: "medium",
  category: "feature",
  dueDate: "",
};

export function useTaskForm(taskId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const { data: task } = useTask(taskId);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (data: TaskFormValues) =>
      taskService.createTask(
        {
          title: data.title,
          description: data.description,
          assigned_to_id: parseInt(data.assigneeId, 10),
          priority: data.priority as TaskPriority,
          category: data.category as TaskCategory,
          due_date: data.dueDate ? data.dueDate : null,
        },
        currentUser.id
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
      router.push("/tasks");
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TaskFormValues) => {
      if (!taskId) throw new Error("Task ID is required");
      return taskService.updateTask(taskId, {
        priority: data.priority as TaskPriority,
        due_date: data.dueDate ? data.dueDate : null,
        assigned_to_id: data.assigneeId
          ? parseInt(data.assigneeId, 10)
          : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
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
        assigneeId: String(task.assigned_to?.id ?? ""),
        priority: task.priority,
        category: task.category,
        dueDate: task.due_date ?? "",
      });
    }
  }, [task, form]);

  const onSubmit = (data: TaskFormValues) => {
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
  };
}
