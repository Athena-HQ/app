import { z } from "zod";
import { TASK_PRIORITIES, TASK_CATEGORIES, TASK_STATUSES, type TaskPriority, type TaskCategory, type TaskStatus } from "@/services/task";

export const taskFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  assigneeId: z
    .string()
    .min(1, "Please select an assignee")
    .refine((value) => {
      const parsed = Number.parseInt(value, 10);
      return Number.isInteger(parsed) && parsed > 0;
    }, "Please select a valid assignee"),
  priority: z.enum(TASK_PRIORITIES as [TaskPriority, ...TaskPriority[]], {
    message: "Please select a priority",
  }),
  category: z.enum(TASK_CATEGORIES as [TaskCategory, ...TaskCategory[]], {
    message: "Please select a category",
  }),
  dueDate: z.string().optional(),
  squadId: z.string().optional(),
});

export const taskStatusUpdateSchema = z.object({
  status: z.enum(TASK_STATUSES as [TaskStatus, ...TaskStatus[]], {
    message: "Please select a status",
  }),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type TaskStatusUpdateValues = z.infer<typeof taskStatusUpdateSchema>;
