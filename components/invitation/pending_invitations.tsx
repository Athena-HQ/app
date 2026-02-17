import { useMemo, useState } from "react";
import {
  type Cell,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Header,
  type PaginationState,
  type Row,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MoreHorizontalIcon,
  SearchIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Frame, FrameFooter } from "@/components/ui/frame";
import { cn } from "@/lib/utils";
import {
  useInvitations,
  useInvitationActions,
  useInvitationFilters,
} from "@/hooks/useInvitation";
import { INVITATION_ROLES, type Invitation, type InvitationRole } from "@/services/invitation";

function formatInviteDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function PendingInvitations() {
  const pageSize = 10;
  const { invitations, isLoading } = useInvitations();
  const { resendInvitation, deleteInvitation } = useInvitationActions();

  const {
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    filteredInvitations,
  } = useInvitationFilters(invitations);

  const pendingInvitations = useMemo(
    () => filteredInvitations.filter((invitation) => invitation.status === "pending"),
    [filteredInvitations]
  );

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "expiresAt", desc: false },
  ]);

  const columns: ColumnDef<Invitation>[] = useMemo(
    () => [
      {
        accessorKey: "email",
        header: "Email",
        size: 320,
        cell: ({ row }: { row: Row<Invitation> }) => (
          <span className="block truncate font-medium" title={row.original.email}>
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 180,
        cell: ({ row }: { row: Row<Invitation> }) => (
          <Badge variant="outline" className="capitalize">
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: "sentAt",
        header: "Sent",
        size: 130,
        cell: ({ row }: { row: Row<Invitation> }) => (
          <span className="text-sm text-muted-foreground">
            {formatInviteDate(row.original.sentAt)}
          </span>
        ),
      },
      {
        accessorKey: "expiresAt",
        header: "Expires",
        size: 130,
        cell: ({ row }: { row: Row<Invitation> }) => {
          const isNearExpiry = row.original.expiresAt.getTime() - Date.now() < 1000 * 60 * 60 * 24;
          return (
            <span className={cn("text-sm", isNearExpiry ? "text-warning font-medium" : "text-muted-foreground")}>
              {formatInviteDate(row.original.expiresAt)}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        size: 70,
        enableSorting: false,
        cell: ({ row }: { row: Row<Invitation> }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => resendInvitation(row.original.id)}>
                <SendIcon />
                Resend Invitation
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => deleteInvitation(row.original.id)}
              >
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [deleteInvitation, resendInvitation]
  );

  const tableOptions = useMemo(
    () => ({
      columns,
      data: pendingInvitations,
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
    }),
    [columns, pagination, pendingInvitations, sorting]
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table returns unstable refs by design
  const table = useReactTable(tableOptions);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Pending Onboarding</h2>
        <p className="text-sm text-muted-foreground">
          Manage and track your pending team invitations.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 min-w-32">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select
          value={roleFilter}
          onValueChange={(value: string) => setRoleFilter(value as InvitationRole | "all")}
        >
          <SelectTrigger className="min-w-40 sm:w-44">
            <SelectValue>{roleFilter === "all" ? "Role" : roleFilter}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {INVITATION_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Frame className="w-full">
          <Table className="table-fixed">
            <TableHeader>
              {columns.map((col, idx) => (
                <TableHead
                  key={idx}
                  style={{
                    width: (col as { size?: number }).size
                      ? `${(col as { size?: number }).size}px`
                      : undefined,
                  }}
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
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Frame>
      ) : (
        <Frame className="w-full">
          <Table className="table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow className="hover:bg-transparent" key={headerGroup.id}>
                  {headerGroup.headers.map((header: Header<Invitation, unknown>) => {
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
                table.getRowModel().rows.map((row: Row<Invitation>) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell: Cell<Invitation, unknown>) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="h-24 text-center" colSpan={columns.length}>
                    No pending invitations found.
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
                      style={{
                        opacity: table.getCanPreviousPage() ? 1 : 0.5,
                        pointerEvents: table.getCanPreviousPage() ? "auto" : "none",
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      className="sm:*:[svg]:hidden"
                      onClick={() => table.nextPage()}
                      style={{
                        opacity: table.getCanNextPage() ? 1 : 0.5,
                        pointerEvents: table.getCanNextPage() ? "auto" : "none",
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </FrameFooter>
        </Frame>
      )}
    </div>
  );
}
