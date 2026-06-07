import * as React from "react";
import { Controller, useWatch } from "react-hook-form";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { listSquads } from "@/services/squad";
import { DatePicker } from "@/components/ui/date_picker";
import { FormError } from "@/components/form_error";
import { useTaskForm } from "@/hooks/useTaskForm";
import { useAssignableUsers } from "@/hooks/useCurrentAppUser";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import { useAISquadSuggestions } from "@/hooks/useAISquadSuggestions";
import { AISuggestionsPanel } from "@/components/task/ai_suggestions_panel";
import { AISquadSuggestionsPanel } from "@/components/task/ai_squad_panel";
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
  Check,
  ChevronsUpDown,
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

type AssignMode = "engineers" | "squads";

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

// ─── Mode Switch ──────────────────────────────────────────────────────────────

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: AssignMode;
  onChange: (m: AssignMode) => void;
}) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1 w-fit">
      <button
        type="button"
        onClick={() => onChange("engineers")}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${
          mode === "engineers"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <User className="h-3.5 w-3.5" />
        Engineers
      </button>
      <button
        type="button"
        onClick={() => onChange("squads")}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${
          mode === "squads"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Users className="h-3.5 w-3.5" />
        Squads
      </button>
    </div>
  );
}

// ─── TaskForm ─────────────────────────────────────────────────────────────────

export function TaskForm({ taskId }: TaskFormProps) {
  const { form, onSubmit, isSubmitting, isCurrentUserReady } = useTaskForm(taskId);
  const { register, control, handleSubmit, formState: { errors }, setValue, getValues } = form;
  const { assignableUsers, isLoading: isAssigneesLoading } = useAssignableUsers();

  // Assignment mode toggle
  const [assignMode, setAssignMode] = React.useState<AssignMode>("engineers");

  // Watch fields needed for AI suggestions
  const watchedTitle = useWatch({ control, name: "title" }) ?? "";
  const watchedDescription = useWatch({ control, name: "description" }) ?? "";
  const watchedCategory = useWatch({ control, name: "category" }) ?? "feature";
  const watchedPriority = useWatch({ control, name: "priority" }) ?? "medium";
  const watchedSquadIds = useWatch({ control, name: "squadIds" }) ?? [];

  const aiReady = watchedTitle.trim().length > 0 && watchedDescription.trim().length > 0;

  // Engineer AI suggestions
  const { suggestions: engineerSuggestions, loading: aiEngLoading, error: aiEngError, trigger: triggerEngAI } =
    useAISuggestions({
      title: watchedTitle,
      description: watchedDescription,
      category: watchedCategory,
      priority: watchedPriority,
    });

  // Squad AI suggestions
  const { suggestions: squadSuggestions, loading: aiSqLoading, error: aiSqError, trigger: triggerSqAI } =
    useAISquadSuggestions({
      title: watchedTitle,
      description: watchedDescription,
      category: watchedCategory,
      priority: watchedPriority,
      excludeSquadIds: watchedSquadIds,
    });

  // Pick handlers
  const handleEngineerPick = React.useCallback(
    (employeeId: number) => {
      const current: string[] = getValues("assigneeIds") ?? [];
      const id = String(employeeId);
      if (!current.includes(id)) {
        setValue("assigneeIds", [...current, id], { shouldDirty: true });
      }
    },
    [getValues, setValue],
  );

  const handleSquadPick = React.useCallback(
    (squadId: number) => {
      const current: string[] = getValues("squadIds") ?? [];
      const id = String(squadId);
      if (!current.includes(id)) {
        setValue("squadIds", [...current, id], { shouldDirty: true });
      }
    },
    [getValues, setValue],
  );

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
          onSubmit={handleSubmit(onSubmit as (data: Record<string, unknown>) => void)}
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

          {/* ── Assignment ─────────────────────────────────────────────── */}
          <FormSection icon={User} title="Assignment *">
            <ModeSwitch mode={assignMode} onChange={setAssignMode} />

            {/* Engineers mode */}
            {assignMode === "engineers" && (
              <>
                <Controller
                  name="assigneeIds"
                  control={control}
                  render={({ field }) => {
                    const selected = field.value;
                    const selectedNames = assigneeOptions
                      .filter((u) => selected.includes(u.id))
                      .map((u) => u.name);
                    return (
                      <FormField
                        icon={User}
                        label="Individuals (Multiple)"
                        error={errors.assigneeIds?.message as string}
                      >
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between font-normal h-auto min-h-10 py-2"
                              disabled={!isCurrentUserReady || isAssigneesLoading}
                            >
                              <span className="flex flex-wrap gap-1 text-left">
                                {selectedNames.length === 0 ? (
                                  <span className="text-muted-foreground">
                                    {isAssigneesLoading ? "Loading..." : "Select individuals…"}
                                  </span>
                                ) : (
                                  selectedNames.map((name) => (
                                    <span
                                      key={name}
                                      className="bg-sky-500/15 text-sky-400 border border-sky-500/30 rounded-full px-2 py-0.5 text-xs"
                                    >
                                      {name}
                                    </span>
                                  ))
                                )}
                              </span>
                              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search individuals…" />
                              <CommandList>
                                <CommandEmpty>No users found.</CommandEmpty>
                                <CommandGroup>
                                  {assigneeOptions.map((user) => {
                                    const isSelected = selected.includes(user.id);
                                    return (
                                      <CommandItem
                                        key={user.id}
                                        value={user.name}
                                        onSelect={() => {
                                          const next = isSelected
                                            ? selected.filter((id: string) => id !== user.id)
                                            : [...selected, user.id];
                                          field.onChange(next);
                                        }}
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${isSelected ? "opacity-100" : "opacity-0"}`}
                                        />
                                        {user.name}
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">Select one or more individuals to assign this task to.</p>
                      </FormField>
                    );
                  }}
                />

                {/* AI Engineer Suggestions */}
                <AISuggestionsPanel
                  suggestions={engineerSuggestions}
                  loading={aiEngLoading}
                  error={aiEngError}
                  onTrigger={triggerEngAI}
                  onPick={handleEngineerPick}
                  disabled={!aiReady}
                />
              </>
            )}

            {/* Squads mode */}
            {assignMode === "squads" && (
              <>
                <Controller
                  name="squadIds"
                  control={control}
                  render={({ field }) => {
                    const selected = field.value;
                    const selectedNames = squads
                      .filter((s) => selected.includes(String(s.id)))
                      .map((s) => s.name);
                    return (
                      <FormField
                        icon={Users}
                        label="Squads (Multiple)"
                        error={errors.squadIds?.message as string}
                      >
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between font-normal h-auto min-h-10 py-2"
                              disabled={isSquadsLoading}
                            >
                              <span className="flex flex-wrap gap-1 text-left">
                                {selectedNames.length === 0 ? (
                                  <span className="text-muted-foreground">
                                    {isSquadsLoading ? "Loading..." : "Select squads…"}
                                  </span>
                                ) : (
                                  selectedNames.map((name) => (
                                    <span
                                      key={name}
                                      className="bg-purple-500/15 text-purple-400 border border-purple-500/30 rounded-full px-2 py-0.5 text-xs"
                                    >
                                      {name}
                                    </span>
                                  ))
                                )}
                              </span>
                              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search squads…" />
                              <CommandList>
                                <CommandEmpty>No squads found.</CommandEmpty>
                                <CommandGroup>
                                  {squads.map((squad) => {
                                    const isSelected = selected.includes(String(squad.id));
                                    return (
                                      <CommandItem
                                        key={squad.id}
                                        value={squad.name}
                                        onSelect={() => {
                                          const next = isSelected
                                            ? selected.filter((id: string) => id !== String(squad.id))
                                            : [...selected, String(squad.id)];
                                          field.onChange(next);
                                        }}
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${isSelected ? "opacity-100" : "opacity-0"}`}
                                        />
                                        {squad.name}
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">Select one or more squads to assign this task to.</p>
                      </FormField>
                    );
                  }}
                />

                {/* AI Squad Suggestions */}
                <AISquadSuggestionsPanel
                  suggestions={squadSuggestions}
                  loading={aiSqLoading}
                  error={aiSqError}
                  onTrigger={triggerSqAI}
                  onPick={handleSquadPick}
                  disabled={!aiReady}
                />
              </>
            )}
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
                <FormField icon={Calendar} label="Due Date" required error={errors.dueDate?.message}>
                  <DatePicker
                    value={field.value || undefined}
                    onChange={(value) => field.onChange(value ?? "")}
                    placeholder="Select a due date"
                  />
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
