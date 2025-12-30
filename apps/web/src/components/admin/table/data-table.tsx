import { flexRender, Table as TanStackTable } from "@tanstack/react-table";
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
  filterKeyPlaceholder?: string;
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
}

export function DataTable<TData>({
  table,
  filterKey = "title",
  filterKeyPlaceholder,
  toolbarLeft,
  toolbarRight
}: DataTableProps<TData>) {
  return (
    <div className="flex h-full flex-col overflow-y-visible">
      {/* Toolbar */}
      <div className="shrink-0 py-4">
        <div className="flex h-8 items-center justify-between gap-2">
          <div className="flex h-full items-center gap-2">
            <Input
              placeholder={`Filter by ${filterKeyPlaceholder || filterKey}...`}
              value={(table.getColumn(filterKey)?.getFilterValue() as string) ?? ""}
              onChange={(e) => table.getColumn(filterKey)?.setFilterValue(e.target.value)}
              className="h-full max-w-sm px-3 py-0 text-sm leading-none"
            />
            {toolbarLeft}
          </div>

          <div className="flex h-full items-center gap-2">
            {toolbarRight}
            <DataTableViewOptions table={table} />
          </div>
        </div>
      </div>

      {/* Table body scrollable */}
      <div className="flex flex-1 rounded-md border">
        <Table className="min-w-full">
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

      {/* Pagination fixed at bottom */}
      <div className="flex shrink-0 justify-end py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
