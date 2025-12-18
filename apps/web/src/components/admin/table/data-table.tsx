import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  Table as TanStackTable,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import { DataTableViewOptions } from "@web/components/admin/table/column-toggle";
import { DataTablePagination } from "@web/components/admin/table/pagination";
import { Input } from "@web/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@web/components/ui/table";

interface DataTableProps<TData> {
  table: TanStackTable<TData>;
  filterKey?: string;
}

export function DataTable<TData>({ table, filterKey = "title" }: DataTableProps<TData>) {
  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center py-4">
        <Input
          placeholder={`Filter by ${filterKey}...`}
          value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn(filterKey)?.setFilterValue(e.target.value)}
          className="max-w-sm"
        />
        <DataTableViewOptions table={table} />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {!header.isPlaceholder &&
                      flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
