import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "@web/components/admin/admin-sidebar";
import { Separator } from "@web/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@web/components/ui/sidebar";

export const Route = createFileRoute("/admin")({
  component: AdminLayout
});

function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="mx-4">
        <header className="border-border flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          </div>
          {/* <h1 className="text-foreground text-xl font-semibold">Admin Dashboard</h1> */}
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
