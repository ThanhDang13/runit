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
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDebounce } from "@web/hooks/use-debounce";
import { createGetContestsInfiniteQueryOptions } from "@web/lib/tanstack/options/contest";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@web/components/ui/dropdown-menu";
import { Button } from "@web/components/ui/button";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "@web/components/ui/scroll-area";

export type Contest = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
};

export const Route = createFileRoute("/admin/contest/")({
  component: AdminContests
});

export const columns: ColumnDef<Contest>[] = [
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

            <Link to="/admin" params={{ id }} className="flex">
              <DropdownMenuItem className="w-full">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </Link>

            <DropdownMenuItem
              className="w-full cursor-pointer text-red-600"
              onClick={() => console.log("delete contest", id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

function AdminContests() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [type] = useState<string | undefined>(undefined); // optional contest type filter

  const filterValue = (columnFilters.find((f) => f.id === "title")?.value as string) ?? "";

  const debouncedFilter = useDebounce(filterValue, 300);

  const { data, isLoading } = useInfiniteQuery(
    createGetContestsInfiniteQueryOptions({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sort: sorting[0]?.id ?? "startTime",
      order: sorting[0]?.desc ? "desc" : "asc"
    })
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

  return (
    <div className="container mx-auto flex h-full flex-1 flex-col gap-4 px-4">
      <DataTable
        table={table}
        filterKey="title"
        toolbarRight={
          <Link to="/admin">
            <Button size="sm" variant="outline" className="ml-auto">
              <Plus className="h-4 w-4" />
              New Contest
            </Button>
          </Link>
        }
      />
    </div>
  );
}
