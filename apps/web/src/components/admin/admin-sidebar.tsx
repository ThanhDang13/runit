import * as React from "react";
import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  User,
  FileText,
  ClipboardList,
  Award
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

const adminItems = [
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="group-data-[collapsible=icon]:hidden">
        <h1 className="data- text-lg font-bold transition-all duration-200">Admin Panel</h1>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {adminItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith(item.url)}>
                  <Link to={item.url} className="flex items-center gap-2">
                    {item.icon && <item.icon />}
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
