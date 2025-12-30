import { Link } from "@tanstack/react-router";
import { Button } from "@web/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@web/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@web/components/ui/avatar";
import { Badge } from "@web/components/ui/badge";
import { Separator } from "@web/components/ui/separator";
import { useTheme } from "@web/components/theme-provider";
import {
  Sun,
  Moon,
  Laptop,
  User,
  ListChecks,
  FileText,
  Trophy,
  LogOut,
  Settings,
  Shield,
  Code2,
  Loader2
} from "lucide-react";
import { cn } from "@web/lib/utils";
import { useAuthStore } from "@web/stores/auth-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createMeQueryOptions } from "@web/lib/tanstack/options/auth";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  const { data: me, isLoading } = useQuery({ ...createMeQueryOptions() });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav
      className={cn(
        "bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur",
        className
      )}
    >
      <div className="flex h-14 w-full items-center px-6">
        {/* Logo */}
        <Link to="/" className="mr-8 flex items-center space-x-2">
          <div className="from-primary to-primary/70 flex items-center justify-center rounded-md bg-linear-to-br p-2 shadow-lg">
            <Code2 className="text-primary-foreground h-4 w-4" />
          </div>
          <span className="hidden text-xl font-bold sm:inline-block">RunIT</span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-1 items-center space-x-1">
          <NavLink to="/problem-list" icon={ListChecks}>
            Problems
          </NavLink>
          <NavLink to="/submissions" icon={FileText}>
            Submissions
          </NavLink>
          <NavLink to="/contests" icon={Trophy}>
            Contests
          </NavLink>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
                {theme === "light" && <Badge className="ml-auto h-4 px-1">✓</Badge>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
                {theme === "dark" && <Badge className="ml-auto h-4 px-1">✓</Badge>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
                <Laptop className="mr-2 h-4 w-4" />
                <span>System</span>
                {theme === "system" && <Badge className="ml-auto h-4 px-1">✓</Badge>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          {/* Auth Controls */}
          {isLoading ? (
            <Button variant="ghost" size="sm" disabled className="gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Loading</span>
            </Button>
          ) : me ? (
            // Logged In
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 px-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{getInitials(me.name)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline">{me.name}</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">{me.name}</p>
                    <p className="text-muted-foreground text-xs leading-none">{me.email}</p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                {/* <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem> */}

                {me.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/admin" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                        <Badge variant="secondary" className="ml-auto h-5 text-xs">
                          Admin
                        </Badge>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    queryClient.clear();
                  }}
                  className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Not Logged In
            <Link to="/login">
              <Button size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

// NavLink Component
interface NavLinkProps {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function NavLink({ to, icon: Icon, children }: NavLinkProps) {
  return (
    <Link
      to={to}
      className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
      activeProps={{
        className: "bg-accent text-accent-foreground"
      }}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden md:inline">{children}</span>
    </Link>
  );
}
