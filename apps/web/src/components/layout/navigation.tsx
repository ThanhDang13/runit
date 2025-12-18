import { Link } from "@tanstack/react-router";
import { Button } from "@web/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@web/components/ui/dropdown-menu";
import { useTheme } from "@web/components/theme-provider";
import { Sun, Moon, Laptop, User, ListChecks, FileText, Trophy } from "lucide-react";
import { cn } from "@web/lib/utils";
import { useAuthStore } from "@web/stores/auth-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createMeQueryOptions } from "@web/lib/tanstack/options/auth";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const { setTheme } = useTheme();
  useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  const { data: me, isLoading } = useQuery({ ...createMeQueryOptions() });

  return (
    <nav className={cn("bg-background border-border sticky top-0 z-50 border-b", className)}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="text-primary text-2xl font-bold">
          RunIT
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link
            to="/problem-list"
            className="text-foreground hover:text-primary flex items-center gap-2 transition-colors"
          >
            <ListChecks className="h-4 w-4" />
            Problem List
          </Link>
          <Link
            to="/submissions"
            className="text-foreground hover:text-primary flex items-center gap-2 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Submissions
          </Link>

          <Link
            to="/"
            className="text-foreground hover:text-primary flex items-center gap-2 transition-colors"
          >
            <Trophy className="h-4 w-4" />
            Contests
          </Link>
        </div>
        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Theme */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] transition-all dark:hidden" />
                <Moon className="hidden h-[1.2rem] w-[1.2rem] transition-all dark:block" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Laptop className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth Controls */}
          {isLoading ? (
            <div className="text-sm opacity-70">Loading...</div>
          ) : me ? (
            // ------- Logged In -------
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {me.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/">Profile</Link>
                </DropdownMenuItem>

                {me.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin</Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    queryClient.clear();
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // ------- Not Logged In -------
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
