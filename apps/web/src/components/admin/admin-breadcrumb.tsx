import { Link } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@web/components/ui/breadcrumb";
import React from "react";

const adminItems = [
  {
    name: "Home",
    url: "/admin"
  },
  {
    name: "Problems",
    url: "/admin/problem"
  },
  {
    name: "Users",
    url: "/admin/user"
  },
  {
    name: "Submissions",
    url: "/admin/submission"
  },
  {
    name: "Contests",
    url: "/admin/contest"
  }
];

export function AdminBreadcrumb() {
  const location = useLocation();
  const path = location.pathname;

  // Find the matching items from adminItems
  const matchedItems = adminItems.filter((item) => path.startsWith(item.url));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {matchedItems.map((item, index) => {
          const isLast = index === matchedItems.length - 1;
          return (
            <React.Fragment key={item.url}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.url}>{item.name}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
