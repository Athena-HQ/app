import * as React from "react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date_picker";
import { FormError } from "@/components/form_error";
import { useTaskForm } from "@/hooks/useTaskForm";
import { useAssignableUsers } from "@/hooks/useCurrentAppUser";
import {
  TASK_PRIORITIES,
  TASK_CATEGORIES,
  type TaskPriority,
  type TaskCategory,
} from "@/services/task";
import { Frame, FramePanel } from "@/components/ui/frame";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  FileText,
  User,
  Flag,
  Tag,
  Calendar,
  X,
} from "lucide-react";

const priorityLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const categoryLabels: Record<string, string> = {
  feature: "Feature",
  bug: "Bug",
  improvement: "Improvement",
  documentation: "Documentation",
  research: "Research",
  testing: "Testing",
  other: "Other",
};

type TaskFormProps = {
  taskId?: string;
};

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-muted-foreground" size={20} />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FormField({
  icon: Icon,
  label,
  required,
  children,
  error,
}: {
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" size={16} />}
        <span>{label}</span>
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      <FormError message={error} />
    </div>
  );
}

export function TaskForm({ taskId }: TaskFormProps) {
  const { form, onSubmit, isSubmitting, isCurrentUserReady } = useTaskForm(taskId);
  const { register, control, handleSubmit, formState: { errors } } = form;
  const { assignableUsers, isLoading: isAssigneesLoading } = useAssignableUsers();
  const assigneeOptions = assignableUsers.map((user) => ({
    id: user.id,
    name: user.isCurrentUser ? `${user.name} (Me)` : `${user.name}${user.role ? ` (${user.role})` : ""}`,
  }));

  return (
    <Frame>
      <FramePanel>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <FormSection icon={FileText} title="Basic Information">
            <FormField
              icon={FileText}
              label="Title"
              required
              error={errors.title?.message}
            >
              <Input
                id="title"
                placeholder="Enter a clear and descriptive task title"
                className="w-full"
                aria-invalid={Boolean(errors.title)}
                {...register("title")}
              />
            </FormField>

            <FormField
              icon={FileText}
              label="Description"
              required
              error={errors.description?.message}
            >
              <Textarea
                id="description"
                placeholder="Provide detailed information about the task"
                rows={5}
                className="w-full"
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
            </FormField>
          </FormSection>

          <Separator />

          <FormSection icon={User} title="Assignment">
            <Controller
              name="assigneeId"
              control={control}
              render={({ field }) => (
                <FormField
                  icon={User}
                  label="Assignee"
                  required
                  error={errors.assigneeId?.message}
                >
                  <Select
                    value={field.value}
                    onValueChange={(value: string) => field.onChange(value)}
                    disabled={isAssigneesLoading || !isCurrentUserReady}
                  >
                    <SelectTrigger id="assigneeId" className="w-full">
                      <SelectValue placeholder="Select a team member to assign this task" />
                    </SelectTrigger>
                    <SelectContent>
                      {assigneeOptions.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />
          </FormSection>

          <Separator />

          <FormSection icon={Tag} title="Classification">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <FormField
                    icon={Flag}
                    label="Priority"
                    error={errors.priority?.message}
                  >
                    <Select
                      value={field.value}
                      onValueChange={(value: string) =>
                        field.onChange(value as TaskPriority)
                      }
                    >
                      <SelectTrigger id="priority" className="w-full">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_PRIORITIES.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priorityLabels[priority]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              />

              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <FormField
                    icon={Tag}
                    label="Category"
                    error={errors.category?.message}
                  >
                    <Select
                      value={field.value}
                      onValueChange={(value: string) =>
                        field.onChange(value as TaskCategory)
                      }
                    >
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {categoryLabels[category]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              />
            </div>
          </FormSection>

          <Separator />

          <FormSection icon={Calendar} title="Timeline">
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <FormField icon={Calendar} label="Due Date">
                  <DatePicker
                    value={field.value || undefined}
                    onChange={(value) => field.onChange(value ?? "")}
                    placeholder="Select a due date (optional)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Optional: Set a deadline for this task
                  </p>
                </FormField>
              )}
            />
          </FormSection>

          <Separator />

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              asChild
              disabled={isSubmitting}
            >
              <Link href="/tasks">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Link>
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (!taskId && (!isCurrentUserReady || isAssigneesLoading))}
            >
              {isSubmitting
                ? "Saving..."
                : taskId
                  ? "Update Task"
                  : "Create Task"}
            </Button>
          </div>
        </form>
      </FramePanel>
    </Frame>
  );
}
