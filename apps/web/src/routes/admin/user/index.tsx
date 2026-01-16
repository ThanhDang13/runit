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
import { useDebounce } from "@web/hooks/use-debounce";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDeleteUserMutationOptions,
  createGetUserByIdQueryOptions,
  createGetUsersInfiniteQueryOptions,
  createUpdateUserMutationOptions,
  UserResponseDto
} from "@web/lib/tanstack/options/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@web/components/ui/dropdown-menu";
import { Button } from "@web/components/ui/button";
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
import { Copy, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@web/components/ui/badge";
import { toast } from "sonner";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@web/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@web/components/ui/form";
import { Input } from "@web/components/ui/input";
import { Switch } from "@web/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@web/components/ui/select";

export const Route = createFileRoute("/admin/user/")({
  component: AdminUsers
});

export const createColumns = ({
  onDelete,
  onEdit
}: {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}): ColumnDef<UserResponseDto>[] => [
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
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />
  },
  {
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => {
      const role = row.original.role.toLowerCase();

      const roleClassMap: Record<string, string> = {
        admin: "bg-red-100 text-red-800",
        user: "bg-blue-100 text-blue-800"
      };

      const classes = roleClassMap[role] ?? "bg-gray-100 text-gray-800";

      return (
        <Badge variant="outline" className={classes}>
          {row.original.role}
        </Badge>
      );
    }
  },

  {
    accessorKey: "active",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Active" />,
    cell: ({ row }) => {
      const active = row.original.active;

      const activeClassMap: Record<string, string> = {
        true: "bg-green-100 text-green-800",
        false: "bg-red-100 text-red-800"
      };

      const classes = activeClassMap[String(active)] ?? "bg-gray-100 text-gray-800";

      return (
        <Badge variant="outline" className={classes}>
          {active ? "active" : "inactive"}
        </Badge>
      );
    }
  },

  {
    accessorKey: "createdAt",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
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

            <DropdownMenuItem
              className="w-full cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                onEdit(id);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>

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
                  <AlertDialogTitle>Delete this user?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently remove the user.
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

function AdminUsers() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const filterValue = (columnFilters.find((f) => f.id === "name")?.value as string) ?? "";
  const debouncedFilter = useDebounce(filterValue, 300);

  React.useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0
    }));
  }, [debouncedFilter]);

  const { data, isLoading } = useInfiniteQuery(
    createGetUsersInfiniteQueryOptions({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sort: sorting[0]?.id ?? "createdAt",
      order: sorting[0]?.desc ? "desc" : "asc",
      keyword: debouncedFilter,
      type: "offset"
    })
  );

  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    ...createDeleteUserMutationOptions(),
    onSuccess: () => {
      toast("User deleted", {
        description: "The user has been successfully removed."
      });

      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      toast.error("Delete failed", {
        description: "Could not delete the user. Please try again."
      });
    }
  });

  const users = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
  const total = useMemo(() => data?.pages[0]?.total ?? 0, [data]);

  const columns = useMemo(
    () =>
      createColumns({
        onDelete: (id) => {
          deleteUserMutation.mutate({ id });
        },
        onEdit: (id) => {
          setEditUserId(id);
          setEditOpen(true);
        }
      }),
    [deleteUserMutation]
  );

  const table = useReactTable({
    data: users,
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
    <div className="container mx-auto flex flex-col gap-4 px-4 py-8">
      <DataTable
        table={table}
        filterKey="name"
        toolbarRight={
          <DeleteSelectedUsers ids={selectedIds} onDone={() => table.resetRowSelection()} />
        }
      />
      <UserViewEditDialog userId={editUserId} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}

interface DeleteSelectedUsersProps {
  ids: string[];
  onDone?: () => void;
}

export function DeleteSelectedUsers({ ids, onDone }: DeleteSelectedUsersProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    ...createDeleteUserMutationOptions(),
    onError: () => {
      toast.error("Delete failed", {
        description: "Some users could not be deleted."
      });
    }
  });

  const handleDelete = async () => {
    try {
      await Promise.all(ids.map((id) => mutation.mutateAsync({ id })));

      toast("Users deleted", {
        description: `${ids.length} users removed.`
      });

      queryClient.invalidateQueries({ queryKey: ["users"] });
      onDone?.();
    } catch {
      // handled in onError
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
          <AlertDialogTitle>Delete {ids.length} users?</AlertDialogTitle>
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

export const UserRoleSchema = z.union([z.literal("user"), z.literal("admin")]);

export const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().min(1),
  role: UserRoleSchema.default("user"),
  active: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const UpdateUserRequestBodySchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})
  .partial()
  .extend({
    password: z.string().min(8).optional()
  });

export type UpdateUserFormValues = z.infer<typeof UpdateUserRequestBodySchema>;

/* ---------------------------------- */
/* Component                           */
/* ---------------------------------- */

type UserViewEditDialogProps = {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UserViewEditDialog({ userId, open, onOpenChange }: UserViewEditDialogProps) {
  const query = useQuery(
    userId ? createGetUserByIdQueryOptions({ id: userId }) : { queryKey: [], enabled: false }
  );

  const mutation = useMutation(userId ? createUpdateUserMutationOptions({ id: userId }) : {});

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(UpdateUserRequestBodySchema),
    defaultValues: {}
  });

  React.useEffect(() => {
    if (query.data) {
      const { id, createdAt, updatedAt, ...rest } = query.data;
      form.reset({
        ...rest,
        role: rest.role ?? "user"
      });
    }
  }, [query.data, form]);

  const onSubmit = (values: UpdateUserFormValues) => {
    if (!userId) return;
    mutation.mutate(values, {
      onSuccess: () => onOpenChange(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>User</DialogTitle>
        </DialogHeader>

        {query.isLoading && <p>Loading user…</p>}
        {query.isError && <p className="text-red-500">{query.error.message}</p>}

        {query.data && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value ?? "user"} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">user</SelectItem>
                        <SelectItem value="admin">admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Active</FormLabel>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={mutation.isPending}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
