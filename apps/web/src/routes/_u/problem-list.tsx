import { createFileRoute, Link } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect, useRef } from "react";
import { Input } from "@web/components/ui/input";
import { Button } from "@web/components/ui/button";
import { Card, CardContent } from "@web/components/ui/card";
import { Badge } from "@web/components/ui/badge";
import { ScrollArea } from "@web/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@web/components/ui/select";
import { CheckCircle2, CircleDashed, XCircle, Search, Code2, Loader2, Filter } from "lucide-react";
import { useDebounce } from "@web/hooks/use-debounce";
import { createGetProblemsInfiniteQueryOptions } from "@web/lib/tanstack/options/problem";
import { cn } from "@web/lib/utils";

export const Route = createFileRoute("/_u/problem-list")({
  component: UserProblemListPage
});

const DIFFICULTY_CONFIG = {
  easy: {
    className: "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    label: "Easy"
  },
  medium: {
    className: "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    label: "Medium"
  },
  hard: {
    className: "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400",
    label: "Hard"
  }
} as const;

const STATUS_CONFIG = {
  solved: {
    icon: CheckCircle2,
    label: "Solved",
    className: "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
  },
  attempted: {
    icon: CircleDashed,
    label: "Attempted",
    className: "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400"
  },
  unsolved: {
    icon: XCircle,
    label: "Todo",
    className: "border-muted bg-muted/50 text-muted-foreground"
  }
} as const;

function UserProblemListPage() {
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [filter, setFilter] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const debouncedFilter = useDebounce(filter, 300);

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      createGetProblemsInfiniteQueryOptions({
        page: 1,
        limit: 10,
        sort: "createdAt",
        order: "desc",
        keyword: debouncedFilter
      })
    );

  const problems = useMemo(() => {
    const allProblems = data?.pages.flatMap((page) => page.data) ?? [];
    if (difficultyFilter === "all") return allProblems;
    return allProblems.filter((p) => p.difficulty.toLowerCase() === difficultyFilter);
  }, [data, difficultyFilter]);

  const total = useMemo(() => data?.pages[0]?.total ?? 0, [data]);

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

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="min-h-full">
        {/* Header */}
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            <div className="mb-6 flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="from-primary to-primary/70 rounded-xl bg-linear-to-br p-2.5 shadow-lg">
                    <Code2 className="text-primary-foreground h-6 w-6" />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight">Problem Set</h1>
                </div>
                <p className="text-muted-foreground">
                  {total} problems to sharpen your coding skills
                </p>
              </div>

              <Badge variant="secondary" className="text-sm">
                {problems.length} loaded
              </Badge>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search problems by title..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-45">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto max-w-7xl px-4 py-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
              <p className="text-muted-foreground text-sm">Loading problems...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="bg-destructive/10 rounded-full p-3">
                  <XCircle className="text-destructive h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Failed to load problems</p>
                  <p className="text-muted-foreground text-sm">Please try again later.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && !error && problems.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="bg-muted rounded-full p-3">
                  <Search className="text-muted-foreground h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">No problems found</p>
                  <p className="text-muted-foreground text-sm">
                    Try adjusting your search or filters
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Problem List */}
          {!isLoading && !error && problems.length > 0 && (
            <>
              <div className="text-muted-foreground mb-4 grid grid-cols-12 gap-4 px-4 text-xs font-medium">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5">Title</div>
                <div className="col-span-3">Difficulty</div>
                <div className="col-span-3">Status</div>
              </div>

              <div className="space-y-2">
                {problems.map((problem, idx) => {
                  const status = problem.status;
                  const statusConfig = STATUS_CONFIG[status ?? "unsolved"];
                  const StatusIcon = statusConfig.icon;
                  const difficultyConfig =
                    DIFFICULTY_CONFIG[
                      problem.difficulty.toLowerCase() as keyof typeof DIFFICULTY_CONFIG
                    ];

                  return (
                    <Link
                      key={problem.id}
                      to={`/problem/$id`}
                      params={{ id: problem.id }}
                      className="block"
                    >
                      <Card className="hover:border-primary/50 transition-all hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-12 items-center gap-4">
                            {/* Index */}
                            <div className="col-span-1 text-center">
                              <span className="text-muted-foreground text-sm font-medium">
                                {idx + 1}
                              </span>
                            </div>

                            {/* Title */}
                            <div className="col-span-5">
                              <h3 className="group-hover:text-primary font-medium transition-colors">
                                {problem.title}
                              </h3>
                            </div>

                            {/* Difficulty */}
                            <div className="col-span-3">
                              <Badge variant="outline" className={difficultyConfig.className}>
                                {difficultyConfig.label}
                              </Badge>
                            </div>

                            {/* Status */}
                            <div className="col-span-3">
                              <Badge
                                variant="outline"
                                className={cn("gap-1.5", statusConfig.className)}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Infinite Scroll Trigger */}
              <div ref={observerTarget} className="flex justify-center py-8">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="text-primary h-5 w-5 animate-spin" />
                    <span className="text-muted-foreground text-sm">Loading more...</span>
                  </div>
                )}
                {!hasNextPage && problems.length > 0 && (
                  <p className="text-muted-foreground text-sm">You've reached the end!</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
