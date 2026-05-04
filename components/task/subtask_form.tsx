"use client";

import * as React from "react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  createSubtask,
  TASK_PRIORITIES,
  TASK_CATEGORIES,
  type TaskPriority,
  type TaskCategory,
  type CreateSubtaskRequest,
} from "@/services/task";
import { DatePicker } from "@/components/ui/date_picker";
import { useAssignableUsers } from "@/hooks/useCurrentAppUser";
import { queryKeys } from "@/lib/query-keys";
import { Plus, Check, ChevronsUpDown } from "lucide-react";

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

type SubtaskFormProps = {
  parentTaskId: number;
  squads?: { id: number; name: string }[];
};

export function SubtaskForm({ parentTaskId }: SubtaskFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [category, setCategory] = useState<TaskCategory>("feature");
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>("");
  const queryClient = useQueryClient();
  const { assignableUsers, isLoading: isAssigneesLoading } = useAssignableUsers();

  const assigneeOptions = assignableUsers.map((user) => ({
    id: String(user.id),
    name: user.isCurrentUser ? `${user.name} (Me)` : `${user.name}${user.role ? ` (${user.role})` : ""}`,
  }));

  const mutation = useMutation({
    mutationFn: (data: CreateSubtaskRequest) =>
      createSubtask(parentTaskId, data),
    onSuccess: () => {
      toast.success("Subtask created successfully");
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.subtasks(String(parentTaskId)),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.detail(String(parentTaskId)),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.all,
      });
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to create subtask");
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setCategory("feature");
    setSelectedAssigneeIds([]);
    setDueDate("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!dueDate) {
      toast.error("Due date is required");
      return;
    }
    if (selectedAssigneeIds.length === 0) {
      toast.error("Please assign at least one person");
      return;
    }
    const payload: CreateSubtaskRequest = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      due_date: dueDate,
      assignee_ids: selectedAssigneeIds.map(Number),
    };
    mutation.mutate(payload);
  };

  const selectedNames = assigneeOptions
    .filter((u) => selectedAssigneeIds.includes(u.id))
    .map((u) => u.name);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Subtask
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Create Subtask</DialogTitle>
          <DialogDescription>
            Add a subtask to break down this task into smaller pieces.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="subtask-title">Title *</Label>
            <Input
              id="subtask-title"
              placeholder="Subtask title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="subtask-description">Description</Label>
            <Textarea
              id="subtask-description"
              placeholder="Optional description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Priority + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority *</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {priorityLabels[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as TaskCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoryLabels[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignees */}
          <div className="space-y-2">
            <Label>Assignees *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal h-auto min-h-10 py-2"
                  disabled={isAssigneesLoading}
                >
                  <span className="flex flex-wrap gap-1 text-left">
                    {selectedNames.length === 0 ? (
                      <span className="text-muted-foreground">
                        {isAssigneesLoading ? "Loading..." : "Select assignees…"}
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
                  <CommandInput placeholder="Search assignees…" />
                  <CommandList>
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                      {assigneeOptions.map((user) => {
                        const isSelected = selectedAssigneeIds.includes(user.id);
                        return (
                          <CommandItem
                            key={user.id}
                            value={user.name}
                            onSelect={() => {
                              setSelectedAssigneeIds((prev) =>
                                isSelected
                                  ? prev.filter((id) => id !== user.id)
                                  : [...prev, user.id]
                              );
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
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date *</Label>
            <DatePicker
              value={dueDate || undefined}
              onChange={(value) => setDueDate(value ?? "")}
              placeholder="Select a due date"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create Subtask"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
