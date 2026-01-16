import { createFileRoute, Link } from "@tanstack/react-router";
import { DataTable } from "@web/components/admin/table/data-table";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  SortingState,
  useReactTable
} from "@tanstack/react-table";
import { DataTableColumnHeader } from "@web/components/admin/table/column-header";
import { Checkbox } from "@web/components/ui/checkbox";
import { useMemo, useState } from "react";
import { useInfiniteQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useDebounce } from "@web/hooks/use-debounce";
import {
  createGetSubmissionsInfiniteQueryOptions,
  Submission,
  SubmissionStatus
} from "@web/lib/tanstack/options/submission";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@web/components/ui/dropdown-menu";
import { Button } from "@web/components/ui/button";
import { Copy, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { Badge } from "@web/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@web/components/ui/alert-dialog";
import { createDeleteSubmissionMutationOptions } from "@web/lib/tanstack/options/submission";
import { Sheet, SheetContent, SheetTrigger } from "@web/components/ui/sheet";
import { SubmissionSummarySheet } from "@web/components/submission-summary-sheet";

export const Route = createFileRoute("/admin/submission/")({
  component: AdminSubmissions
});

const submissionStatusVariantMap: Record<
  SubmissionStatus,
  "default" | "destructive" | "secondary" | "outline"
> = {
  pending: "secondary",
  accepted: "default",
  wrong_answer: "destructive",
  time_limit_exceeded: "secondary",
  runtime_error: "outline",
  compilation_error: "outline"
};

const submissionStatusLabelMap: Record<SubmissionStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  wrong_answer: "Wrong Answer",
  time_limit_exceeded: "Time Limit Exceeded",
  runtime_error: "Runtime Error",
  compilation_error: "Compilation Error"
};

export function SubmissionVerdictBadge({ status }: { status: Submission["status"] }) {
  return (
    <Badge variant={submissionStatusVariantMap[status]}>{submissionStatusLabelMap[status]}</Badge>
  );
}

export const createColumns = (onDelete: (id: string) => void): ColumnDef<Submission>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    )
  },
  {
    id: "user",
    header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
    cell: ({ row }) => row.original.user?.name ?? "Deleted User"
  },
  {
    id: "problem",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Problem" />,
    cell: ({ row }) => row.original.problem.title
  },
  {
    id: "verdict",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Verdict" />,
    cell: ({ row }) => <SubmissionVerdictBadge status={row.original.status} />
  },
  {
    accessorKey: "language",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Language" />
  },
  {
    id: "passed",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Passed" />,
    cell: ({ row }) => `${row.original.summary.totalPassed}/${row.original.summary.total}`
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted At" />,
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      })
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(id)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy ID
            </DropdownMenuItem>

            <Sheet>
              <SheetTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                  className="w-full"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
              </SheetTrigger>

              <SheetContent side="right" className="w-full max-w-2/5 p-0">
                <SubmissionSummarySheet submission={row.original} isCurrentUser={false} />
              </SheetContent>
            </Sheet>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="w-full cursor-pointer text-red-600"
                  onSelect={(e) => e.preventDefault()} // keep menu open
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this submission?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently remove the submission.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

interface DeleteSelectedSubmissionsProps {
  ids: string[];
  onDone?: () => void;
}

export function DeleteSelectedSubmissions({ ids, onDone }: DeleteSelectedSubmissionsProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...createDeleteSubmissionMutationOptions(),
    onError: () => {
      toast.error("Delete failed", {
        description: "Some submissions could not be deleted."
      });
    },
    onSuccess: () => {
      toast("Submissions deleted", {
        description: `${ids.length} submissions removed.`
      });
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      onDone?.();
    }
  });

  const handleDelete = async () => {
    try {
      await Promise.all(ids.map((id) => mutation.mutateAsync({ id })));
    } catch (error) {
      console.error("Error deleting submissions:", error);
    }
  };

  if (ids.length === 0) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={mutation.isPending}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete selected ({ids.length})
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {ids.length} submissions?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Yes, delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function AdminSubmissions() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const { data } = useInfiniteQuery(
    createGetSubmissionsInfiniteQueryOptions({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sort: sorting[0]?.id ?? "createdAt",
      order: sorting[0]?.desc ? "desc" : "asc",
      userId: undefined
    })
  );

  const queryClient = useQueryClient();

  const deleteSubmissionMutation = useMutation({
    ...createDeleteSubmissionMutationOptions(),
    onSuccess: () => {
      toast("Submission deleted", {
        description: "The submission has been successfully removed."
      });

      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
    onError: () => {
      toast.error("Delete failed", {
        description: "Could not delete the submission. Please try again."
      });
    }
  });

  const submissions = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);
  const total = useMemo(() => data?.pages[0]?.total ?? 0, [data]);

  const columns = useMemo(
    () =>
      createColumns((id) => {
        deleteSubmissionMutation.mutate({ id });
      }),
    [deleteSubmissionMutation]
  );

  const table = useReactTable({
    data: submissions,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    state: { pagination, sorting, columnFilters },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel()
  });

  const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original.id);

  return (
    <div className="container mx-auto flex h-full flex-1 flex-col gap-4 px-4">
      <DataTable
        table={table}
        filterable={false}
        filterKey="user"
        toolbarRight={
          <DeleteSelectedSubmissions ids={selectedIds} onDone={() => table.resetRowSelection()} />
        }
      />
    </div>
  );
}
