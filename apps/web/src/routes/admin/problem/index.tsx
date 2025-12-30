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
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useDebounce } from "@web/hooks/use-debounce";
import { createGetProblemsInfiniteQueryOptions, Problem } from "@web/lib/tanstack/options/problem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@web/components/ui/dropdown-menu";
import { Button } from "@web/components/ui/button";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@web/components/ui/badge";

export const Route = createFileRoute("/admin/problem/")({
  component: AdminProblems
});

export const columns: ColumnDef<Problem>[] = [
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
    accessorKey: "difficulty",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Difficulty" />,
    cell: ({ row }) => {
      const difficulty = row.original.difficulty.toLowerCase();

      const difficultyClassMap: Record<string, string> = {
        easy: "bg-green-100 text-green-800",
        medium: "bg-yellow-100 text-yellow-800",
        hard: "bg-red-100 text-red-800"
      };

      const classes = difficultyClassMap[difficulty] ?? "bg-gray-100 text-gray-800";

      return (
        <Badge variant="outline" className={classes}>
          {row.original.difficulty}
        </Badge>
      );
    }
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="End" />,
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
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

            <Link to="/admin/problem/$id" params={{ id }} className="flex">
              <DropdownMenuItem className="w-full">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </Link>

            <DropdownMenuItem
              className="w-full cursor-pointer text-red-600"
              onClick={() => console.log("delete", id)}
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

function AdminProblems() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // const [filterKey, setFilterKey] = useState<keyof Problem>("title");

  const filterValue = (columnFilters.find((f) => f.id === "title")?.value as string) ?? "";

  const debouncedFilter = useDebounce(filterValue, 300);

  const { data, isLoading } = useInfiniteQuery(
    createGetProblemsInfiniteQueryOptions({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sort: sorting[0]?.id ?? "createdAt",
      order: sorting[0]?.desc ? "desc" : "asc",
      keyword: debouncedFilter
    })
  );

  const problems = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const total = useMemo(() => data?.pages[0]?.total ?? 0, [data]);

  const table = useReactTable({
    data: problems,
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
    <div className="container mx-auto flex flex-col gap-4 px-4 py-8">
      <DataTable
        table={table}
        filterKey="title"
        toolbarRight={
          <Link to="/admin/problem/new">
            <Button size="sm" variant="outline" className="ml-auto">
              <Plus className="h-4 w-4" />
              New Problem
            </Button>
          </Link>
        }
      />
    </div>
  );
}
