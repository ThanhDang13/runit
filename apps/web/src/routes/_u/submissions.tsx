import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Filter,
  Loader2,
  User,
  X,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@web/components/ui/badge";
import { Button } from "@web/components/ui/button";
import { Card, CardContent } from "@web/components/ui/card";
import { ScrollArea } from "@web/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@web/components/ui/select";
import { Separator } from "@web/components/ui/separator";
import { Skeleton } from "@web/components/ui/skeleton";

import { Sheet, SheetContent, SheetTrigger } from "@web/components/ui/sheet";
import { createMeQueryOptions } from "@web/lib/tanstack/options/auth";
import {
  createGetSubmissionsInfiniteQueryOptions,
  GetSubmissionsRequestQueryDto
} from "@web/lib/tanstack/options/submission";
import { cn } from "@web/lib/utils";

import z from "zod";
import { SubmissionSummarySheet } from "@web/components/submission-summary-sheet";

export const Route = createFileRoute("/_u/submissions")({
  component: SubmissionsPage,
  validateSearch: (search) =>
    z
      .object({
        problemId: z.string().optional()
      })
      .parse(search)
});

const STATUS_CONFIG = {
  accepted: {
    icon: CheckCircle2,
    className: "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400",
    bgClass: "bg-green-500/10"
  },
  wrong_answer: {
    icon: XCircle,
    className: "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    bgClass: "bg-yellow-500/10"
  },
  runtime_error: {
    icon: XCircle,
    className: "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400",
    bgClass: "bg-red-500/10"
  },
  compilation_error: {
    icon: XCircle,
    className: "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400",
    bgClass: "bg-red-500/10"
  },
  time_limit_exceeded: {
    icon: Clock,
    className: "border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    bgClass: "bg-orange-500/10"
  },
  pending: {
    icon: Clock,
    className: "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-500/10"
  }
} as const;

const LANGUAGE_CONFIG = {
  python: {
    label: "Python",
    className: "border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400"
  },
  java: {
    label: "Java",
    className: "border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400"
  },
  cpp: {
    label: "C++",
    className: "border-purple-500/50 bg-purple-500/10 text-purple-600 dark:text-purple-400"
  },
  javascript: {
    label: "JavaScript",
    className: "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
  }
} as const;

function SubmissionsPage() {
  const { data: me } = useQuery(createMeQueryOptions());

  const [language, setLanguage] = useState<string | undefined>();
  const [status, setStatus] = useState<GetSubmissionsRequestQueryDto["status"]>();
  const search = useSearch({ from: "/_u/submissions" });
  const [problemId, setProblemId] = useState<string | undefined>(search.problemId ?? undefined);
  const [userId, setUserId] = useState<string | undefined>(me?.id);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProblemId(search.problemId ?? undefined);
  }, [search]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    createGetSubmissionsInfiniteQueryOptions({
      page: 1,
      limit: 15,
      sort: "createdAt",
      order: "desc",
      language,
      status,
      problemId,
      userId
    })
  );

  const submissions = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  const hasActiveFilters = language || status || problemId || userId !== me?.id;

  const clearFilters = () => {
    setLanguage(undefined);
    setStatus(undefined);
    setProblemId(undefined);
    setUserId(me?.id);
  };

  useEffect(() => {
    anchor.current?.scrollIntoView({ inline: "start", behavior: "instant" });
  }, [language, status, userId, problemId]);

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

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const anchor = useRef<HTMLDivElement>(null);

  return (
    <div className="flex h-full gap-6 p-6">
      {/* Left Panel: Filters */}
      <ScrollArea className="px-4">
        <div className="w-80 shrink-0">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="from-primary to-primary/70 rounded-xl bg-linear-to-br p-2.5 shadow-lg">
                  <FileText className="text-primary-foreground h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
              </div>
              <p className="text-muted-foreground text-sm">
                Track and review your coding submissions
              </p>
            </div>

            {/* Stats */}
            {submissions.length > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{submissions.length}</div>
                    <div className="text-muted-foreground text-xs">Submissions Loaded</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters Card */}
            <Card>
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm font-semibold">Filters</span>
                  </div>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-7 gap-1 px-2 text-xs"
                    >
                      <X className="h-3 w-3" />
                      Clear
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  {/* User Filter */}
                  <div className="space-y-1.5">
                    <label className="text-muted-foreground text-xs font-medium">Scope</label>
                    <Select
                      value={userId ?? "all"}
                      onValueChange={(val) => setUserId(val === "all" ? undefined : me?.id)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Submissions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={me?.id || "me"}>My Submissions</SelectItem>
                        <SelectItem value="all">All Submissions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Language Filter */}
                  <div className="space-y-1.5">
                    <label className="text-muted-foreground text-xs font-medium">Language</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Languages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-1.5">
                    <label className="text-muted-foreground text-xs font-medium">Status</label>
                    <Select
                      value={status}
                      onValueChange={(value) =>
                        setStatus(value as GetSubmissionsRequestQueryDto["status"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="wrong_answer">Wrong Answer</SelectItem>
                        <SelectItem value="runtime_error">Runtime Error</SelectItem>
                        <SelectItem value="compilation_error">Compilation Error</SelectItem>
                        <SelectItem value="time_limit_exceeded">Time Limit Exceeded</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>

      {/* Right Panel: Submissions List */}
      <div className="min-w-0 flex-1">
        <ScrollArea className="h-full">
          <div ref={anchor} />
          <div className="space-y-4 px-4">
            {/* Loading State */}
            {isLoading && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-64" />
                        </div>
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && submissions.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                  <div className="bg-muted rounded-full p-4">
                    <Clock className="text-muted-foreground h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">No submissions found</h3>
                    <p className="text-muted-foreground text-sm">
                      {hasActiveFilters
                        ? "Try adjusting your filters to see more results"
                        : "Start solving problems to see your submissions here"}
                    </p>
                  </div>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Submissions List */}
            {!isLoading && submissions.length > 0 && (
              <>
                <div className="space-y-2">
                  {submissions.map((submission) => {
                    const statusConfig =
                      STATUS_CONFIG[submission.status as keyof typeof STATUS_CONFIG];
                    const StatusIcon = statusConfig?.icon || XCircle;
                    const langConfig =
                      LANGUAGE_CONFIG[
                        submission.language.toLowerCase() as keyof typeof LANGUAGE_CONFIG
                      ];
                    const isCurrentUser = submission.user?.id === me?.id;

                    return (
                      <Card
                        key={submission.id}
                        className="hover:border-primary/50 transition-all hover:shadow-md"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {/* Status Icon */}
                            <div className={cn("rounded-full p-2", statusConfig?.bgClass)}>
                              <StatusIcon
                                className={cn(
                                  "h-6 w-6",
                                  submission.status === "accepted"
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                )}
                              />
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <h3 className="truncate font-semibold">
                                  {submission.problem.title}
                                </h3>
                                {isCurrentUser && (
                                  <Badge
                                    variant="outline"
                                    className="border-blue-500/50 bg-blue-500/10 text-xs text-blue-600 dark:text-blue-400"
                                  >
                                    You
                                  </Badge>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className={statusConfig?.className}>
                                  {submission.summary.verdict}
                                </Badge>

                                {langConfig && (
                                  <Badge variant="outline" className={langConfig.className}>
                                    {langConfig.label}
                                  </Badge>
                                )}

                                <Separator orientation="vertical" className="h-4" />

                                {submission.user?.name && (
                                  <>
                                    <div className="text-muted-foreground flex items-center gap-1 text-xs">
                                      <User className="h-3 w-3" />
                                      {submission.user.name}
                                    </div>
                                    <Separator orientation="vertical" className="h-4" />
                                  </>
                                )}

                                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(submission.createdAt)}
                                </div>
                              </div>
                            </div>

                            {/* Action */}
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                                  <Eye className="h-3.5 w-3.5" />
                                  View
                                </Button>
                              </SheetTrigger>

                              <SheetContent side="right" className="w-full max-w-2/5 p-0">
                                <SubmissionSummarySheet
                                  submission={submission}
                                  isCurrentUser={isCurrentUser}
                                />
                              </SheetContent>
                            </Sheet>
                          </div>
                        </CardContent>
                      </Card>
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
                  {!hasNextPage && submissions.length > 0 && (
                    <p className="text-muted-foreground text-sm">All submissions loaded</p>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
