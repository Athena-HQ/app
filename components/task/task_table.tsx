"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type Row,
  type Header,
  type Cell,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronUpIcon, Users, User, GitBranch } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useCurrentAppUser } from "@/hooks/useCurrentAppUser";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Frame, FrameFooter } from "@/components/ui/frame";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TaskListResponse, TaskPriority } from "@/services/task";
import { TaskStatusBadge } from "./task_status_badge";
import { AlertCircle } from "lucide-react";

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-blue-500/10 text-blue-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
};

type TaskTableProps = {
  tasks: TaskListResponse[];
  isLoading?: boolean;
  needsReviewIds?: Set<string>;
};

export function TaskTable({ tasks, isLoading, needsReviewIds }: TaskTableProps) {
  const pageSize = 10;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      desc: true,
      id: "due_date",
    },
  ]);

  const { appUser } = useCurrentAppUser();
  const currentUserName = appUser ? appUser.name : null;

  const columns: ColumnDef<TaskListResponse>[] = useMemo(() => [
    {
      accessorKey: "title",
      cell: ({ row }: { row: Row<TaskListResponse> }) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/tasks/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.getValue("title")}
          </Link>
          {(row.original.subtask_count ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <GitBranch className="h-3 w-3" />
              {row.original.subtask_count}
            </span>
          )}
        </div>
      ),
      header: "Title",
      size: 250,
    },
    {
      accessorKey: "status",
      cell: ({ row }: { row: Row<TaskListResponse> }) => {
        const status = row.original.status;
        const needsReview = needsReviewIds?.has(String(row.original.id));
        return (
          <div className="flex items-center gap-2">
            <TaskStatusBadge status={status} />
            {needsReview && (
              <Badge variant="warning" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Review
              </Badge>
            )}
          </div>
        );
      },
      header: "Status",
      size: 150,
    },
    {
      accessorKey: "priority",
      cell: ({ row }: { row: Row<TaskListResponse> }) => {
        const priority = row.original.priority;
        return (
          <Badge className={cn("text-xs", priorityColors[priority])}>
            {priority}
          </Badge>
        );
      },
      header: "Priority",
      size: 100,
    },
    {
      id: "assigned_to",
      cell: ({ row }: { row: Row<TaskListResponse> }) => {
        const { assignment_type, assigned_to_name, squads } = row.original;
        return (
          <div className="flex flex-col gap-1">
            {(assignment_type === "squad" || assignment_type === "both") && squads && squads.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {squads.map((squad) => (
                  <Badge key={squad.id} className="text-xs bg-purple-500/15 text-purple-400 border-purple-500/25 hover:bg-purple-500/20 w-fit">
                    <Users className="h-3 w-3 mr-1" />
                    {squad.name}
                  </Badge>
                ))}
              </div>
            )}
            {(assignment_type === "individual" || assignment_type === "both") && assigned_to_name && (
              <div className="flex flex-wrap gap-1">
                {assigned_to_name.split(', ').map((name, i) => {
                  const isMe = name === currentUserName;
                  return (
                    <Badge 
                      key={i} 
                      className={cn(
                        "text-xs w-fit",
                        isMe 
                          ? "bg-primary/15 text-primary border-primary/25 hover:bg-primary/20"
                          : "bg-sky-500/15 text-sky-400 border-sky-500/25 hover:bg-sky-500/20"
                      )}
                    >
                      <User className="h-3 w-3 mr-1" />
                      {isMe ? "Me" : name}
                    </Badge>
                  );
                })}
              </div>
            )}
            {assignment_type === "none" && (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        );
      },
      header: "Assigned To",
      size: 200,
    },
    {
      accessorKey: "assigned_by_name",
      cell: ({ row }: { row: Row<TaskListResponse> }) => {
        const name = row.original.assigned_by_name;
        const isMe = name === currentUserName;
        return (
          <div className="text-sm text-muted-foreground">
            {isMe ? "Me" : (name ?? "—")}
          </div>
        );
      },
      header: "Assigned By",
      size: 150,
    },
    {
      accessorKey: "category",
      cell: ({ row }: { row: Row<TaskListResponse> }) => (
        <Badge variant="outline" className="text-xs">
          {row.original.category}
        </Badge>
      ),
      header: "Category",
      size: 120,
    },
    {
      accessorKey: "due_date",
      cell: ({ row }: { row: Row<TaskListResponse> }) => {
        const dueDate = row.original.due_date;
        if (!dueDate) return <span className="text-muted-foreground">-</span>;
        const isOverdue =
          new Date(dueDate) < new Date() &&
          row.original.status !== "completed" &&
          row.original.status !== "under_review";
        return (
          <span
            className={cn(
              "text-sm",
              isOverdue && "text-destructive font-medium"
            )}
          >
            {new Date(dueDate).toLocaleDateString()}
          </span>
        );
      },
      header: "Due Date",
      size: 120,
    },
  ], [needsReviewIds]);

  const tableOptions = useMemo(() => ({
    columns,
    data: tasks,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
  }), [columns, tasks, pagination, sorting]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns unstable refs by design
  const table = useReactTable(tableOptions);

  if (isLoading) {
    return (
      <Frame className="w-full">
        <Table className="table-fixed">
          <TableHeader>
            {columns.map((col, idx) => (
              <TableHead
                key={idx}
                style={{ width: (col as { size?: number }).size ? `${(col as { size?: number }).size}px` : undefined }}
              >
                {typeof col.header === "string" ? col.header : ""}
              </TableHead>
            ))}
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                {columns.map((_, idx) => (
                  <TableCell key={idx}>
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Frame>
    );
  }

  if (tasks.length === 0) {
    return (
      <Frame className="w-full">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: { id: string; headers: Header<TaskListResponse, unknown>[] }) => (
              <TableRow className="hover:bg-transparent" key={headerGroup.id}>
                {headerGroup.headers.map((header: Header<TaskListResponse, unknown>) => {
                  const columnSize = header.column.getSize();
                  return (
                    <TableHead
                      key={header.id}
                      style={
                        columnSize ? { width: `${columnSize}px` } : undefined
                      }
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className="flex h-full cursor-pointer select-none items-center justify-between gap-2"
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: (
                              <ChevronUpIcon
                                aria-hidden="true"
                                className="size-4 shrink-0 opacity-80"
                              />
                            ),
                            desc: (
                              <ChevronDownIcon
                                aria-hidden="true"
                                className="size-4 shrink-0 opacity-80"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                No tasks found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Frame>
    );
  }

  return (
    <Frame className="w-full">
      <Table className="table-fixed">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className="hover:bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const columnSize = header.column.getSize();
                return (
                  <TableHead
                    key={header.id}
                    style={
                      columnSize ? { width: `${columnSize}px` } : undefined
                    }
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <div
                        className="flex h-full cursor-pointer select-none items-center justify-between gap-2"
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()?.(e);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: (
                            <ChevronUpIcon
                              aria-hidden="true"
                              className="size-4 shrink-0 opacity-80"
                            />
                          ),
                          desc: (
                            <ChevronDownIcon
                              aria-hidden="true"
                              className="size-4 shrink-0 opacity-80"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row: Row<TaskListResponse>) => {
              const needsReview = needsReviewIds?.has(String(row.original.id));
              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    "cursor-pointer hover:bg-muted/50",
                    needsReview && "bg-warning/5 border-l-2 border-l-warning"
                  )}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (!target.closest("a")) {
                      window.location.href = `/tasks/${row.original.id}`;
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell: Cell<TaskListResponse, unknown>) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                No tasks found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <FrameFooter className="p-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <p className="text-muted-foreground text-sm">Viewing</p>
            <Select
              onValueChange={(value: string) => {
                table.setPageIndex(Number(value) - 1);
              }}
              value={String(table.getState().pagination.pageIndex + 1)}
            >
              <SelectTrigger
                aria-label="Select result range"
                className="w-fit min-w-none"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: table.getPageCount() }, (_, i) => {
                  const start = i * table.getState().pagination.pageSize + 1;
                  const end = Math.min(
                    (i + 1) * table.getState().pagination.pageSize,
                    table.getRowCount()
                  );
                  const pageNum = i + 1;
                  return (
                    <SelectItem key={pageNum} value={String(pageNum)}>
                      {`${start}-${end}`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-sm">
              of{" "}
              <strong className="font-medium text-foreground">
                {table.getRowCount()}
              </strong>{" "}
              results
            </p>
          </div>

          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="sm:*:[svg]:hidden"
                  onClick={() => table.previousPage()}
                  style={{ pointerEvents: table.getCanPreviousPage() ? "auto" : "none", opacity: table.getCanPreviousPage() ? 1 : 0.5 }}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  className="sm:*:[svg]:hidden"
                  onClick={() => table.nextPage()}
                  style={{ pointerEvents: table.getCanNextPage() ? "auto" : "none", opacity: table.getCanNextPage() ? 1 : 0.5 }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </FrameFooter>
    </Frame>
  );
}
