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
  createGetContestsInfiniteQueryOptions,
  GetContestResponseDto
} from "@web/lib/tanstack/options/contest";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@web/components/ui/dropdown-menu";
import { Button } from "@web/components/ui/button";
import { Copy, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@web/components/ui/scroll-area";
import { Badge } from "@web/components/ui/badge";
import { Prettify } from "@api/app/common/types/common";
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
import { createDeleteContestMutationOptions } from "@web/lib/tanstack/options/contest";

export const Route = createFileRoute("/admin/contest/")({
  component: AdminContests
});

type Contest = Prettify<Omit<GetContestResponseDto, "problems" | "participants">>;

function getContestStatus(contest: Contest) {
  const now = Date.now();
  const start = new Date(contest.startTime).getTime();
  const end = new Date(contest.endTime).getTime();

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "ended";
}

function ContestStatusBadge({ status }: { status: "upcoming" | "live" | "ended" }) {
  const map = {
    upcoming: "secondary",
    live: "default",
    ended: "outline"
  } as const;

  const label = {
    upcoming: "Upcoming",
    live: "Live",
    ended: "Ended"
  } as const;

  return <Badge variant={map[status]}>{label[status]}</Badge>;
}

export const createColumns = (onDelete: (id: string) => void): ColumnDef<Contest>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />
  },
  {
    id: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = getContestStatus(row.original);
      return <ContestStatusBadge status={status} />;
    }
  },
  {
    accessorKey: "startTime",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Start" />,
    cell: ({ row }) => {
      const date = new Date(row.original.startTime);
      return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      });
    }
  },
  {
    accessorKey: "endTime",
    header: ({ column }) => <DataTableColumnHeader column={column} title="End" />,
    cell: ({ row }) => {
      const date = new Date(row.original.endTime);
      return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      });
    }
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

            <DropdownMenuItem
              className="w-full cursor-pointer"
              onClick={async () => await navigator.clipboard.writeText(id)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy ID
            </DropdownMenuItem>

            <Link to="/admin/contest/$id" params={{ id }} className="flex">
              <DropdownMenuItem className="w-full">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </Link>

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
                  <AlertDialogTitle>Delete this contest?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently remove the contest.
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

interface DeleteSelectedContestsProps {
  ids: string[];
  onDone?: () => void;
}

export function DeleteSelectedContests({ ids, onDone }: DeleteSelectedContestsProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...createDeleteContestMutationOptions(),
    onError: () => {
      toast.error("Delete failed", {
        description: "Some contests could not be deleted."
      });
    },
    onSuccess: () => {
      toast("Contests deleted", {
        description: `${ids.length} contests removed.`
      });
      queryClient.invalidateQueries({ queryKey: ["contests"] });
      onDone?.();
    }
  });

  const handleDelete = async () => {
    try {
      await Promise.all(ids.map((id) => mutation.mutateAsync({ id })));
    } catch (error) {
      console.error("Error deleting contests:", error);
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
          <AlertDialogTitle>Delete {ids.length} contests?</AlertDialogTitle>
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

function AdminContests() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const filterValue = (columnFilters.find((f) => f.id === "title")?.value as string) ?? "";

  const debouncedFilter = useDebounce(filterValue, 300);

  const { data, isLoading } = useInfiniteQuery(
    createGetContestsInfiniteQueryOptions({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sort: sorting[0]?.id ?? "startTime",
      order: sorting[0]?.desc ? "desc" : "asc",
      keyword: debouncedFilter
    })
  );

  const queryClient = useQueryClient();

  const deleteContestMutation = useMutation({
    ...createDeleteContestMutationOptions(),
    onSuccess: () => {
      toast("Contest deleted", {
        description: "The contest has been successfully removed."
      });
      queryClient.invalidateQueries({ queryKey: ["contests"] });
    },
    onError: () => {
      toast.error("Delete failed", {
        description: "Could not delete the contest. Please try again."
      });
    }
  });

  const columns = useMemo(
    () =>
      createColumns((id) => {
        deleteContestMutation.mutate({ id });
      }),
    [deleteContestMutation, queryClient]
  );

  const contests = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
  const total = useMemo(() => data?.pages[0]?.total ?? 0, [data]);

  const table = useReactTable({
    data: contests,
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
        filterKey="title"
        toolbarRight={
          <>
            <DeleteSelectedContests ids={selectedIds} onDone={() => table.resetRowSelection()} />
            <Link to="/admin/contest/new">
              <Button size="sm" variant="outline" className="ml-auto">
                <Plus className="h-4 w-4" />
                New Contest
              </Button>
            </Link>
          </>
        }
      />
    </div>
  );
}
