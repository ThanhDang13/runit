import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "@web/components/theme-provider";
import { Toaster } from "sonner";
import { Navbar } from "@web/components/layout/navigation";

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <main className="relative flex h-screen min-h-screen flex-col">
            <Outlet />
            <Toaster />
          </main>
        </ThemeProvider>
        <TanStackRouterDevtools />
      </>
    );
  }
});
