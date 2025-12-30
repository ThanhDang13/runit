import { createFileRoute, Link } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect, useRef } from "react";
import { Input } from "@web/components/ui/input";
import { Button } from "@web/components/ui/button";
import { Card, CardContent, CardHeader } from "@web/components/ui/card";
import { Badge } from "@web/components/ui/badge";
import { ScrollArea } from "@web/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@web/components/ui/select";
import {
  CheckCircle2,
  CircleDashed,
  XCircle,
  Search,
  Calendar,
  Loader2,
  Filter,
  Trophy,
  Clock,
  Users,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useDebounce } from "@web/hooks/use-debounce";
import { createGetContestsInfiniteQueryOptions } from "@web/lib/tanstack/options/contest";
import { cn } from "@web/lib/utils";

export const Route = createFileRoute("/_u/contests")({
  component: UserContestListPage
});

const STATUS_CONFIG = {
  upcoming: {
    label: "Upcoming",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    badgeClassName: "bg-blue-500 text-white",
    icon: Clock
  },
  running: {
    label: "Live",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    badgeClassName: "bg-emerald-500 text-white",
    icon: Sparkles
  },
  ended: {
    label: "Ended",
    className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    badgeClassName: "bg-gray-500 text-white",
    icon: CheckCircle2
  }
} as const;

function UserContestListPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      createGetContestsInfiniteQueryOptions({
        type: "offset",
        page: 1,
        limit: 10,
        sort: "startTime",
        order: "desc"
      })
    );

  const contests = useMemo(() => {
    const allContests = data?.pages.flatMap((page) => page.data) ?? [];

    const now = new Date();

    const withStatus = allContests.map((contest) => {
      let status: "upcoming" | "running" | "ended";
      const start = new Date(contest.startTime);
      const end = new Date(contest.endTime);

      if (now < start) status = "upcoming";
      else if (now >= start && now <= end) status = "running";
      else status = "ended";

      return { ...contest, status };
    });

    if (statusFilter === "all") return withStatus;
    return withStatus.filter((c) => c.status === statusFilter);
  }, [data, statusFilter]);

  const total = useMemo(() => data?.pages[0]?.total ?? 0, [data]);

  const stats = useMemo(() => {
    const allContests = data?.pages.flatMap((page) => page.data) ?? [];
    const now = new Date();

    return {
      upcoming: allContests.filter((c) => new Date(c.startTime) > now).length,
      running: allContests.filter((c) => {
        const start = new Date(c.startTime);
        const end = new Date(c.endTime);
        return now >= start && now <= end;
      }).length,
      ended: allContests.filter((c) => new Date(c.endTime) < now).length
    };
  }, [data]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const formatTimeRemaining = (startTime: string, endTime: string, status: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (status === "upcoming") {
      const diff = start.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) return `Starts in ${days}d ${hours}h`;
      return `Starts in ${hours}h`;
    }

    if (status === "running") {
      const diff = end.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d remaining`;
      }
      if (hours > 0) return `${hours}h ${minutes}m left`;
      return `${minutes}m left`;
    }

    return "Completed";
  };

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="from-muted/30 to-background min-h-full bg-linear-to-b">
        {/* Header */}
        <div className="bg-background/95 supports-backdrop-filter:bg-background/60 border-b backdrop-blur">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="from-primary to-primary/70 rounded-xl bg-linear-to-br p-2.5 shadow-lg">
                    <Trophy className="text-primary-foreground h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight">Contests</h1>
                    <p className="text-muted-foreground text-sm">
                      Challenge yourself and compete with others
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="mb-4 flex gap-2">
                <div className="w-full flex-1">
                  <div className="p-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
                      <p className="text-muted-foreground text-xs">Upcoming</p>
                    </div>
                  </div>
                </div>

                <div className="w-full flex-1">
                  <div className="p-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">{stats.running}</p>
                      <p className="text-muted-foreground text-xs">Live</p>
                    </div>
                  </div>
                </div>

                <div className="w-full flex-1">
                  <div className="p-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">{stats.ended}</p>
                      <p className="text-muted-foreground text-xs">Ended</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contests</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="running">Live Now</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-1" />

              <Badge variant="secondary" className="self-center px-3 py-1">
                {contests.length} of {total} contests
              </Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="text-primary mb-4 h-12 w-12 animate-spin" />
              <p className="text-lg font-medium">Loading contests...</p>
              <p className="text-muted-foreground text-sm">Preparing amazing challenges for you</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-destructive/20">
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="bg-destructive/10 rounded-full p-4">
                  <XCircle className="text-destructive h-8 w-8" />
                </div>
                <div>
                  <p className="text-xl font-semibold">Failed to load contests</p>
                  <p className="text-muted-foreground mt-1">Please try again later.</p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && !error && contests.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="bg-muted rounded-full p-4">
                  <Search className="text-muted-foreground h-8 w-8" />
                </div>
                <div>
                  <p className="text-xl font-semibold">No contests found</p>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your filters to see more contests
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contest Grid */}
          {!isLoading && !error && contests.length > 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {contests.map((contest) => {
                  const statusConfig =
                    STATUS_CONFIG[contest.status.toLowerCase() as keyof typeof STATUS_CONFIG];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <Link
                      key={contest.id}
                      to={`/contest/$id`}
                      params={{ id: contest.id }}
                      className="group block"
                    >
                      <Card
                        className={cn(
                          "h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                          "hover:border-primary/50 border-2",
                          statusConfig.className
                        )}
                      >
                        <CardHeader className="space-y-3 pb-4">
                          <div className="flex items-start justify-between gap-2">
                            <Badge className={cn("gap-1", statusConfig.badgeClassName)}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                            <ArrowRight className="text-muted-foreground h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </div>

                          <h3 className="group-hover:text-primary line-clamp-2 text-xl leading-tight font-bold transition-colors">
                            {contest.title}
                          </h3>

                          {contest.description && (
                            <p className="text-muted-foreground line-clamp-2 text-sm">
                              {contest.description}
                            </p>
                          )}
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="text-muted-foreground h-4 w-4" />
                            <span className="font-medium">
                              {formatTimeRemaining(
                                contest.startTime,
                                contest.endTime,
                                contest.status
                              )}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="text-muted-foreground h-4 w-4" />
                              <span className="text-muted-foreground">
                                {new Date(contest.startTime).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Infinite Scroll Trigger */}
              <div ref={observerTarget} className="mt-12 flex justify-center">
                {isFetchingNextPage && (
                  <div className="bg-muted flex items-center gap-3 rounded-full px-6 py-3">
                    <Loader2 className="text-primary h-5 w-5 animate-spin" />
                    <span className="font-medium">Loading more contests...</span>
                  </div>
                )}
                {!hasNextPage && contests.length > 0 && (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="text-muted-foreground h-8 w-8" />
                    <p className="text-muted-foreground text-sm">You've seen all contests!</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
