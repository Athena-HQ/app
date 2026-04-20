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
import { useQuery } from "@tanstack/react-query";
import { listSquads } from "@/services/squad";
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
  Users,
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
  title: React.ReactNode;
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
  
  const { data: squads = [], isLoading: isSquadsLoading } = useQuery({
    queryKey: ["squads"],
    queryFn: listSquads,
  });

  const assigneeOptions = assignableUsers.map((user) => ({
    id: user.id,
    name: user.isCurrentUser ? `${user.name} (Me)` : `${user.name}${user.role ? ` (${user.role})` : ""}`,
  }));

  return (
    <Frame>
      <FramePanel>
        <form
          onSubmit={handleSubmit(onSubmit as any)}
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

          <FormSection icon={User} title="Assignment *">
            <Controller
              name="assigneeIds"
              control={control}
              render={({ field }) => (
                <FormField
                  icon={User}
                  label="Individuals (Multiple)"
                  error={errors.assigneeIds?.message as string}
                >
                  <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[50px] max-h-[150px] overflow-y-auto bg-background">
                    {assigneeOptions.length === 0 && !isAssigneesLoading && (
                      <span className="text-sm text-muted-foreground py-1">No users available</span>
                    )}
                    {isAssigneesLoading && (
                      <span className="text-sm text-muted-foreground py-1">Loading users...</span>
                    )}
                    {assigneeOptions.map((user) => {
                      const isSelected = field.value.includes(user.id);
                      return (
                        <div
                          key={user.id}
                          onClick={() => {
                            if (!isCurrentUserReady) return;
                            const newVals = isSelected
                              ? field.value.filter((id) => id !== user.id)
                              : [...field.value, user.id];
                            field.onChange(newVals);
                          }}
                          className={`cursor-pointer px-3 py-1.5 text-xs rounded-full border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            isSelected
                              ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                              : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                          }`}
                        >
                          <User className="h-3.5 w-3.5" />
                          {user.name}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Select one or more individuals to assign this task to.</p>
                </FormField>
              )}
            />

            <Controller
              name="squadIds"
              control={control}
              render={({ field }) => (
                <FormField
                  icon={Users}
                  label="Squads (Multiple)"
                  error={errors.squadIds?.message as string}
                >
                  <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[50px] max-h-[150px] overflow-y-auto bg-background">
                    {squads.length === 0 && !isSquadsLoading && (
                      <span className="text-sm text-muted-foreground py-1">No squads available</span>
                    )}
                    {isSquadsLoading && (
                      <span className="text-sm text-muted-foreground py-1">Loading squads...</span>
                    )}
                    {squads.map((squad) => {
                      const isSelected = field.value.includes(String(squad.id));
                      return (
                        <div
                          key={squad.id}
                          onClick={() => {
                            if (!isCurrentUserReady) return;
                            const newVals = isSelected
                              ? field.value.filter((id) => id !== String(squad.id))
                              : [...field.value, String(squad.id)];
                            field.onChange(newVals);
                          }}
                          className={`cursor-pointer px-3 py-1.5 text-xs rounded-full border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            isSelected
                              ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                              : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                          }`}
                        >
                          <Users className="h-3.5 w-3.5" />
                          {squad.name}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Select one or more squads to assign this task to.</p>
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
