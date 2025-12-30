import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";

export const Route = createFileRoute("/admin/")({
  component: AdminHome
});

function AdminHome() {
  return (
    <div className="container mx-auto grid gap-6 py-8 md:grid-cols-2 lg:grid-cols-4">
      <DashboardCard title="Problems" value="Manage problems" to="/admin/problems" />
      <DashboardCard title="Users" value="Manage users" to="/admin/users" />
      <DashboardCard title="Submissions" value="View submissions" to="/admin/submissions" />
      <DashboardCard title="Settings" value="Admin settings" to="/admin/settings" />
    </div>
  );
}

function DashboardCard({ title, value, to }: { title: string; value: string; to: string }) {
  return (
    <Link to={to} className="transition hover:scale-[1.02]">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">{value}</CardContent>
      </Card>
    </Link>
  );
}
