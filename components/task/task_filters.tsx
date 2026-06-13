import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  type TaskStatus,
  type TaskPriority,
} from "@/services/task";
import type { TaskFilters } from "@/services/task";

type TaskFiltersProps = {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
};

const statusLabels: Record<TaskStatus, string> = {
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  under_review: "Under Review",
  reviewed: "Reviewed",
  on_hold: "On Hold",
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function TaskFiltersComponent({
  filters,
  onFiltersChange,
}: TaskFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchInput || undefined });
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const updateFilter = <K extends keyof TaskFilters>(
    key: K,
    value: TaskFilters[K] | undefined
  ) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label>Search by title</Label>
        <Input
          className="mt-2"
          placeholder="Search tasks..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <Label>Status</Label>
        <Select
          value={filters.status || "all"}
          onValueChange={(value: string) =>
            updateFilter(
              "status",
              value === "all" ? undefined : (value as TaskStatus)
            )
          }
        >
          <SelectTrigger className="w-full capitalize">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {TASK_STATUSES.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {statusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Priority</Label>
        <Select
          value={filters.priority || "all"}
          onValueChange={(value: string) =>
            updateFilter(
              "priority",
              value === "all" ? undefined : (value as TaskPriority)
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {TASK_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priorityLabels[priority]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
    </div>
  );
}
