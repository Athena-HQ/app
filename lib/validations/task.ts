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
  assigneeIds: z.array(z.string()),
  priority: z.enum(TASK_PRIORITIES as [TaskPriority, ...TaskPriority[]], {
    message: "Please select a priority",
  }),
  category: z.enum(TASK_CATEGORIES as [TaskCategory, ...TaskCategory[]], {
    message: "Please select a category",
  }),
  dueDate: z.string().min(1, "Due date is required"),
  squadIds: z.array(z.string()),
}).superRefine((data, ctx) => {
  const hasIndividuals = data.assigneeIds && data.assigneeIds.length > 0;
  const hasSquads = data.squadIds && data.squadIds.length > 0;
  
  if (!hasIndividuals && !hasSquads) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please assign to individuals or squads.",
      path: ["assigneeIds"],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please assign to individuals or squads.",
      path: ["squadIds"],
    });
  } else if (hasIndividuals && hasSquads) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A task cannot be assigned to both individuals and squads.",
      path: ["assigneeIds"],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A task cannot be assigned to both individuals and squads.",
      path: ["squadIds"],
    });
  }
});

export const taskStatusUpdateSchema = z.object({
  status: z.enum(TASK_STATUSES as [TaskStatus, ...TaskStatus[]], {
    message: "Please select a status",
  }),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type TaskStatusUpdateValues = z.infer<typeof taskStatusUpdateSchema>;
