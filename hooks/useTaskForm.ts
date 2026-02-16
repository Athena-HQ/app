"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { taskFormSchema, type TaskFormValues } from "@/lib/validations/task";
import { taskService, type TaskPriority, type TaskCategory } from "@/services/task";
import { getCurrentUser } from "@/services/hierarchy";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTask } from "./useTasks";
import { toast } from "sonner";

function validateWithZod(value: TaskFormValues) {
  const result = taskFormSchema.safeParse(value);
  if (result.success) {
    return undefined;
  }

  const fieldErrors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const fieldName = issue.path[0] as string;
    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = issue.message;
    }
  });

  return fieldErrors;
}

export function useTaskForm(taskId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const { data: task } = useTask(taskId);

  const createMutation = useMutation({
    mutationFn: (data: TaskFormValues) => taskService.createTask({
      title: data.title,
      description: data.description,
      assigned_to_id: parseInt(data.assigneeId, 10),
      priority: data.priority as TaskPriority,
      category: data.category as TaskCategory,
      due_date: data.dueDate ? data.dueDate : null,
    }, currentUser.id),
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
        assigned_to_id: data.assigneeId ? parseInt(data.assigneeId, 10) : undefined,
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

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      assigneeId: "",
      priority: "medium" as const,
      category: "feature" as const,
      dueDate: "",
    } as TaskFormValues,
    onSubmit: async ({ value }) => {
      if (taskId) {
        updateMutation.mutate(value);
      } else {
        createMutation.mutate(value);
      }
    },
    validators: {
      onSubmit: ({ value }) => validateWithZod(value),
      onBlur: ({ value }) => validateWithZod(value),
    },
  });

  useEffect(() => {
    if (task) {
      form.setFieldValue("title", task.title);
      form.setFieldValue("description", task.description);
      form.setFieldValue("assigneeId", String(task.assigned_to?.id ?? ""));
      form.setFieldValue("priority", task.priority);
      form.setFieldValue("category", task.category);
      form.setFieldValue("dueDate", task.due_date ?? "");
    }
  }, [task, form]);

  return {
    form,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
  };
}

