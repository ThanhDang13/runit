import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminBreadcrumb } from "@web/components/admin/admin-breadcrumb";
import { AdminSidebar } from "@web/components/admin/admin-sidebar";
import { Card, CardContent, CardDescription, CardTitle } from "@web/components/ui/card";
import { ScrollArea } from "@web/components/ui/scroll-area";
import { Separator } from "@web/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@web/components/ui/sidebar";
import { createMeQueryOptions } from "@web/lib/tanstack/options/auth";
import { AlertCircle, Home } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout
});

function AdminLayout() {
  const navigate = useNavigate();
  const { data: me, isLoading } = useQuery(createMeQueryOptions());

  useEffect(() => {
    if (me && me.role !== "admin") {
      navigate({ to: "/" });
    }
  }, [me, navigate]);

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border shadow">
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <div className="relative">
              <div className="border-border border-t-accent h-12 w-12 animate-spin rounded-full border-4"></div>
              <div className="border-border absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 opacity-20"></div>
            </div>
            <div className="space-y-2 text-center">
              <CardTitle className="text-foreground text-xl font-semibold">
                Loading your dashboard
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                This will only take a moment...
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!me || me.role !== "admin") {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border shadow">
          <CardContent className="flex flex-col items-center gap-6 py-8">
            <div className="bg-destructive/10 text-destructive flex h-16 w-16 items-center justify-center rounded-full">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div className="space-y-2 text-center">
              <CardTitle className="text-foreground text-2xl font-bold">Access Denied</CardTitle>
              <CardDescription className="text-muted-foreground">
                You need administrator privileges to view this page.
              </CardDescription>
            </div>
            <Link
              to="/"
              className="bg-accent text-accent-foreground hover:bg-accent/90 inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium shadow-sm transition active:scale-95"
            >
              <Home className="h-4 w-4" />
              Return to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider className="flex h-full">
      <AdminSidebar />
      <SidebarInset className="mx-4 flex h-full flex-1 flex-col">
        <header className="border-border sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <AdminBreadcrumb />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="flex h-full flex-1">
            <Outlet />
          </ScrollArea>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
