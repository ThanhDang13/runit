import { createFileRoute, Link } from "@tanstack/react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Input } from "@web/components/ui/input";
import { Button } from "@web/components/ui/button";
import { Card } from "@web/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  CircleDashed,
  XCircle,
  Search,
  Code2
} from "lucide-react";
import { useDebounce } from "@web/hooks/use-debounce";
import { createGetProblemsInfiniteQueryOptions } from "@web/lib/tanstack/options/problem";
import { Badge } from "@web/components/ui/badge";

export const Route = createFileRoute("/_u/problem-list")({
  component: UserProblemListPage
});

function UserProblemListPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<{ id: string; desc: boolean } | null>(null);
  const [filter, setFilter] = useState("");

  const debouncedFilter = useDebounce(filter, 300);

  const { data, isLoading, error } = useInfiniteQuery(
    createGetProblemsInfiniteQueryOptions({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sort: sorting?.id ?? "createdAt",
      order: sorting?.desc ? "desc" : "asc",
      keyword: debouncedFilter
    })
  );

  const problems = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const total = useMemo(() => data?.pages[0]?.total ?? 0, [data]);

  const totalPages = Math.ceil((total ?? 0) / pagination.pageSize);

  const handleSort = (field: string) => {
    setSorting((prev) =>
      prev && prev.id === field ? { id: field, desc: !prev.desc } : { id: field, desc: false }
    );
  };

  const sortedIcon = useMemo(() => {
    if (!sorting) return null;
    return sorting.desc ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />;
  }, [sorting]);

  const difficultyStyle = {
    easy: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
    medium:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
    hard: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800"
  } as const;

  const statusConfig = {
    solved: {
      variant: "default" as const,
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: "Solved",
      className:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
    },
    attempted: {
      variant: "secondary" as const,
      icon: <CircleDashed className="h-3.5 w-3.5" />,
      label: "Attempted",
      className:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800"
    },
    unsolved: {
      variant: "outline" as const,
      icon: <XCircle className="h-3.5 w-3.5" />,
      label: "Todo",
      className: ""
    }
  };

  const currentStatus = statusConfig.unsolved;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-10 border-b backdrop-blur">
        <div className="container flex flex-col gap-6 px-4 py-8 md:px-6 lg:px-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Code2 className="h-8 w-8" />
              <h1 className="text-4xl font-bold tracking-tight">Problems</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Sharpen your skills with programming challenges.
            </p>
          </div>

          <div className="relative max-w-md">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search problems..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 md:px-6 lg:px-8">
        {/* Table Header */}
        <div className="text-muted-foreground mb-4 grid grid-cols-12 gap-4 border-b pb-3 text-sm font-medium">
          <button
            className="hover:text-foreground col-span-6 flex items-center gap-2 text-left transition-colors"
            onClick={() => handleSort("title")}
          >
            Title {sorting?.id === "title" && sortedIcon}
          </button>

          <button
            className="hover:text-foreground col-span-3 flex items-center gap-2 text-left transition-colors"
            onClick={() => handleSort("difficulty")}
          >
            Difficulty {sorting?.id === "difficulty" && sortedIcon}
          </button>

          <div className="col-span-3">Status</div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="border-muted border-t-foreground h-8 w-8 animate-spin rounded-full border-4" />
            <p className="text-muted-foreground mt-4 text-sm">Loading problems...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="p-8 text-center">
            <p className="text-destructive font-medium">Failed to load problems</p>
            <p className="text-muted-foreground mt-1 text-sm">Please try again later.</p>
          </Card>
        )}

        {/* Empty */}
        {!isLoading && !error && problems.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No problems found.</p>
          </Card>
        )}

        {/* List */}
        <div className="space-y-2">
          {problems.map((problem) => (
            <Link key={problem.id} to={`/problem/$id`} params={{ id: problem.id }}>
              <Card className="group hover:bg-accent cursor-pointer transition-colors">
                <div className="grid grid-cols-12 items-center gap-4 p-4">
                  <div className="group-hover:text-foreground col-span-6 font-medium transition-colors">
                    {problem.title}
                  </div>

                  <div className="col-span-3">
                    <Badge
                      variant="outline"
                      className={
                        difficultyStyle[
                          problem.difficulty.toLowerCase() as keyof typeof difficultyStyle
                        ]
                      }
                    >
                      {problem.difficulty}
                    </Badge>
                  </div>

                  <div className="col-span-3">
                    <Badge
                      variant={currentStatus.variant}
                      className={`gap-1.5 ${currentStatus.className}`}
                    >
                      {currentStatus.icon}
                      {currentStatus.label}
                    </Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.pageIndex === 0}
              onClick={() =>
                setPagination((p) => ({ ...p, pageIndex: Math.max(p.pageIndex - 1, 0) }))
              }
            >
              Previous
            </Button>

            <div className="flex items-center gap-1 px-4 text-sm">
              <span className="text-muted-foreground">Page</span>
              <span className="font-medium">{pagination.pageIndex + 1}</span>
              <span className="text-muted-foreground">of</span>
              <span className="font-medium">{totalPages || 1}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={(pagination.pageIndex + 1) * pagination.pageSize >= (total ?? 0)}
              onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
