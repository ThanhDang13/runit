import { createFileRoute } from "@tanstack/react-router";
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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@web/hooks/use-debounce";

export const Route = createFileRoute("/admin/")({
  component: AdminIndex
});

type Problem = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  createdAt: string;
  updatedAt: string;
};

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
    header: ({ column }) => <DataTableColumnHeader column={column} title="Difficulty" />
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />
  }
];

interface FetchProblemsParams {
  page: number;
  limit: number;
  sort: string;
  order: "asc" | "desc";
  keyword?: string;
}

async function fetchProblems({ page, limit, sort, order, keyword }: FetchProblemsParams) {
  const params = new URLSearchParams({
    type: "offset",
    page: page.toString(),
    limit: limit.toString(),
    sort,
    order
  });

  if (keyword) {
    params.append("keyword", keyword); // send filter to backend
  }

  const res = await fetch(`/api/v1/problems?${params.toString()}`);

  if (!res.ok) throw new Error("Failed to fetch problems");
  return res.json();
}

function AdminIndex() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const filterValue = (columnFilters.find((f) => f.id === "title")?.value as string) ?? "";

  const debouncedFilter = useDebounce(filterValue, 300);

  const { data, isLoading } = useQuery({
    queryKey: ["problems", pagination, sorting, debouncedFilter],
    queryFn: () =>
      fetchProblems({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        sort: sorting[0]?.id ?? "createdAt",
        order: sorting[0]?.desc ? "desc" : "asc",
        keyword: debouncedFilter
      })
  });

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil((data?.total ?? 0) / pagination.pageSize),
    state: { pagination, sorting, columnFilters },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <div className="container mx-auto flex flex-col gap-4 py-8">
      <DataTable table={table} filterKey="title" />
    </div>
  );
}
