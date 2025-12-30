import * as React from "react";
import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  User,
  FileText,
  ClipboardList,
  Award,
  Home
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from "@web/components/ui/sidebar";
import { Link, useLocation } from "@tanstack/react-router";
import { AdminNav } from "@web/components/admin/admin-nav";
import { useQuery } from "@tanstack/react-query";
import { create } from "lodash";
import { createMeQueryOptions } from "@web/lib/tanstack/options/auth";

const adminItems = [
  {
    name: "Home",
    url: "/admin",
    icon: Home
  },
  {
    name: "Problems",
    url: "/admin/problem",
    icon: FileText
  },
  {
    name: "Users",
    url: "/admin/user",
    icon: User
  },
  {
    name: "Submissions",
    url: "/admin/submission",
    icon: ClipboardList
  },
  {
    name: "Contests",
    url: "/admin/contest",
    icon: Award
  }
];

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { data: me } = useQuery(createMeQueryOptions());

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex flex-col gap-1 px-4 py-2 group-data-[collapsible=icon]:hidden">
        <h1 className="text-lg font-bold transition-all duration-200">Admin Panel</h1>
        <p className="text-muted-foreground text-xs">
          Manage problems, users, contests & submissions
        </p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {adminItems.map((item) => {
              const isActive =
                item.url === "/admin"
                  ? location.pathname === "/admin"
                  : location.pathname.startsWith(item.url);
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link to={item.url} className="flex items-center gap-2">
                      {item.icon && <item.icon />}
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 py-2">
        <AdminNav
          user={{
            id: me?.id ?? "",
            name: me?.name ?? "Unknown",
            email: me?.email ?? "unknown@example.com",
            role: me?.role ?? "user"
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
