import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "@web/components/layout/navigation";

export const Route = createFileRoute("/_u")({
  component: UserLayout
});

function UserLayout() {
  return (
    <div className="flex h-full flex-col">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
