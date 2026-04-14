"use client";

import * as React from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  createSubtask,
  TASK_PRIORITIES,
  TASK_CATEGORIES,
  type TaskPriority,
  type TaskCategory,
  type CreateSubtaskRequest,
} from "@/services/task";
import { getSquadMembers, type SquadMemberResponse } from "@/services/squad";
import { queryKeys } from "@/lib/query-keys";
import { Plus } from "lucide-react";

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
  squadId?: number | null;
};

export function SubtaskForm({ parentTaskId, squadId }: SubtaskFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [category, setCategory] = useState<TaskCategory>("feature");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: squadMembers = [] } = useQuery({
    queryKey: squadId ? queryKeys.squads.members(String(squadId)) : ["no-squad"],
    queryFn: () => (squadId ? getSquadMembers(squadId) : Promise.resolve([])),
    enabled: open && Boolean(squadId),
    staleTime: 1000 * 60 * 5,
  });

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
    setAssigneeId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    const payload: CreateSubtaskRequest = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
    };
    if (assigneeId && assigneeId !== "none") {
      payload.assigned_to_id = Number(assigneeId);
    }
    mutation.mutate(payload);
  };

  const memberName = (m: SquadMemberResponse) => {
    const u = m.app_user;
    const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
    return name || u.email;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Subtask
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Subtask</DialogTitle>
          <DialogDescription>
            Add a subtask to break down this task into smaller pieces.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subtask-title">Title *</Label>
            <Input
              id="subtask-title"
              placeholder="Subtask title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
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

          {squadId && (
            <div className="space-y-2">
              <Label>Assignee (Squad Member)</Label>
              <Select
                value={assigneeId}
                onValueChange={setAssigneeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a squad member..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {squadMembers.map((m) => (
                    <SelectItem key={m.app_user.id} value={String(m.app_user.id)}>
                      {memberName(m)} · {m.role_in_squad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
