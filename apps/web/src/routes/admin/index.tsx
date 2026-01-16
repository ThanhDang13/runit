import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";

export const Route = createFileRoute("/admin/")({
  component: AdminHome
});

function AdminHome() {
  return (
    <div className="container mx-auto grid gap-6 py-8 md:grid-cols-2 lg:grid-cols-4">
      <DashboardCard title="Problems" value="Manage problems" to="/admin/problem" />
      <DashboardCard title="Users" value="Manage users" to="/admin/user" />
      <DashboardCard title="Submissions" value="View submissions" to="/admin/submission" />
      <DashboardCard title="Contests" value="View contests" to="/admin/contest" />
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
