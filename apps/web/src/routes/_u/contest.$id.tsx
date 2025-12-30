import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ScrollArea } from "@web/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";
import { Badge } from "@web/components/ui/badge";
import { Button } from "@web/components/ui/button";
import { Separator } from "@web/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@web/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@web/components/ui/select";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Users,
  ListOrdered,
  UserPlus,
  Code2,
  FileText,
  AlertCircle,
  Timer,
  Bug,
  Eye,
  Group,
  Trophy,
  Medal,
  Clipboard,
  CircleDashed
} from "lucide-react";
import {
  createGetContestByIdQueryOptions,
  createGetContestSubmissionsInfiniteQueryOptions,
  createJoinContestMutationOptions
} from "@web/lib/tanstack/options/contest";
import { useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { createMeQueryOptions } from "@web/lib/tanstack/options/auth";
import { Submission } from "@web/lib/tanstack/options/submission";
import { Sheet, SheetContent, SheetTrigger } from "@web/components/ui/sheet";
import { SubmissionSummarySheet } from "@web/components/submission-summary-sheet";
import { cn } from "@web/lib/utils";

export const Route = createFileRoute("/_u/contest/$id")({
  component: RouteComponent
});

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

function RouteComponent() {
  const { id } = useParams({ from: "/_u/contest/$id" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: me } = useQuery({ ...createMeQueryOptions() });

  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: contest, isLoading, error } = useQuery(createGetContestByIdQueryOptions(id));

  const { data: submissionsData, isLoading: submissionsLoading } = useInfiniteQuery(
    createGetContestSubmissionsInfiniteQueryOptions(id, {
      limit: 50,
      sort: "createdAt",
      order: "desc",
      language: selectedLanguage !== "all" ? selectedLanguage : undefined,
      status: selectedStatus !== "all" ? (selectedStatus as Submission["status"]) : undefined
    })
  );

  const submissions = useMemo(() => {
    return submissionsData?.pages.flatMap((page) => page.data) ?? [];
  }, [submissionsData]);

  const total = useMemo(() => submissionsData?.pages[0]?.total ?? 0, [submissionsData]);

  const joinMutation = useMutation({
    ...createJoinContestMutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contest", id] });
      toast.success("Successfully joined the contest!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to join contest");
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <XCircle className="text-destructive mb-4 h-12 w-12" />
        <p className="text-xl font-semibold">Failed to load contest</p>
        <p className="text-muted-foreground mt-2">Please try again later.</p>
      </div>
    );
  }

  // Compute status
  const now = new Date();
  const startTime = new Date(contest.startTime);
  const endTime = new Date(contest.endTime);
  let status: "upcoming" | "running" | "ended" = "upcoming";
  if (now >= startTime && now <= endTime) status = "running";
  else if (now > endTime) status = "ended";

  const statusConfig = {
    upcoming: { className: "bg-blue-500 hover:bg-blue-600", label: "Upcoming" },
    running: { className: "bg-emerald-500 hover:bg-emerald-600", label: "Live" },
    ended: { className: "bg-gray-500 hover:bg-gray-600", label: "Ended" }
  };

  const hasJoined = me ? contest.participants.some((p) => p.userId === me.id) : false;

  const handleJoinContest = () => {
    joinMutation.mutate(id);
  };

  const handleProblemClick = (problemId: string) => {
    if (hasJoined && status === "running") {
      navigate({
        to: "/contest/$contestId/problem/$problemId",
        params: { contestId: id, problemId: problemId }
      });
    } else {
      navigate({ to: "/problem/$id", params: { id: problemId } });
    }
  };

  const getStatusBadge = (submissionStatus: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: React.ElementType }> =
      {
        accepted: {
          label: "Accepted",
          className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          icon: CheckCircle2
        },
        wrong_answer: {
          label: "Wrong Answer",
          className: "bg-red-500/10 text-red-600 border-red-500/20",
          icon: XCircle
        },
        time_limit_exceeded: {
          label: "Time Limit",
          className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
          icon: Timer
        },
        runtime_error: {
          label: "Runtime Error",
          className: "bg-orange-500/10 text-orange-600 border-orange-500/20",
          icon: Bug
        },
        compilation_error: {
          label: "Compilation Error",
          className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
          icon: AlertCircle
        },
        pending: {
          label: "Pending",
          className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          icon: Loader2
        }
      };
    return (
      statusMap[submissionStatus] || {
        label: submissionStatus,
        className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
        icon: FileText
      }
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{contest.title}</h1>
                <Badge className={statusConfig[status].className}>
                  {statusConfig[status].label}
                </Badge>
              </div>
              {contest.description && (
                <p className="text-muted-foreground text-lg">{contest.description}</p>
              )}
            </div>

            {!me ? (
              <Button size="lg" className="gap-2" onClick={() => navigate({ to: "/login" })}>
                <UserPlus className="h-4 w-4" />
                Login to Join
              </Button>
            ) : (
              !hasJoined &&
              status !== "ended" && (
                <Button
                  onClick={handleJoinContest}
                  disabled={joinMutation.isPending}
                  size="lg"
                  className="gap-2"
                >
                  {joinMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Join Contest
                </Button>
              )
            )}

            {hasJoined && (
              <Badge
                variant="outline"
                className="gap-2 self-start border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-emerald-700 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-4 w-4" />
                Joined
              </Badge>
            )}
          </div>

          {/* Time Info Card */}
          <Card>
            <CardContent className="flex flex-wrap gap-6 p-6">
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Start Time</p>
                  <p className="text-muted-foreground text-sm">{startTime.toLocaleString()}</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">End Time</p>
                  <p className="text-muted-foreground text-sm">{endTime.toLocaleString()}</p>
                </div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="flex items-center gap-2">
                <Users className="text-muted-foreground h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">Participants</p>
                  <p className="text-muted-foreground text-sm">
                    {contest.participants.length} joined
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="problems" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="problems" className="gap-2">
              <ListOrdered className="h-4 w-4" />
              Problems
            </TabsTrigger>
            <TabsTrigger value="submissions" className="gap-2">
              <Code2 className="h-4 w-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="participants" className="gap-2">
              <Users className="h-4 w-4" />
              Participants
            </TabsTrigger>
          </TabsList>

          {/* Problems Tab */}
          <TabsContent value="problems">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListOrdered className="h-5 w-5" />
                  Problems ({contest.problems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contest.problems.length === 0 ? (
                  <div className="border-border/40 bg-muted/30 rounded-lg border px-6 py-12 text-center">
                    <Clipboard
                      className="text-muted-foreground mx-auto mb-3 h-12 w-12"
                      aria-hidden="true"
                    />
                    <p className="text-foreground text-lg font-medium">No problems available</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Check back later for new challenges!
                    </p>
                  </div>
                ) : (
                  contest.problems.map((problem, idx) => {
                    const status = problem.status ?? "unsolved";
                    const statusConfig = STATUS_CONFIG[status];
                    const StatusIcon = statusConfig.icon;

                    return (
                      <Card
                        key={problem.id}
                        className="hover:border-primary cursor-pointer transition-all hover:shadow-md"
                        onClick={() => handleProblemClick(problem.problemId)}
                      >
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                              {idx + 1}
                            </div>
                            <span className="font-medium">{problem.title}</span>
                          </div>

                          <div>
                            <Badge
                              variant="outline"
                              className={cn("gap-1.5", statusConfig.className)}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5" />
                    Submissions {total}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Languages</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="wrong_answer">Wrong Answer</SelectItem>
                        <SelectItem value="time_limit_exceeded">Time Limit</SelectItem>
                        <SelectItem value="runtime_error">Runtime Error</SelectItem>
                        <SelectItem value="compilation_error">Compilation Error</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {submissionsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="text-primary h-8 w-8 animate-spin" />
                      <p className="text-muted-foreground text-sm">Loading submissions...</p>
                    </div>
                  </div>
                ) : !submissions || submissions.length === 0 ? (
                  <div className="rounded-lg border py-12 text-center">
                    <FileText className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                    <p className="text-lg font-medium">No submissions yet</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Be the first to submit a solution!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submissions.map((submission) => {
                      const statusInfo = getStatusBadge(submission.status);
                      const StatusIcon = statusInfo.icon;
                      const isPending = submission.status === "pending";
                      const isCurrentUser = submission.user.id === me?.id;

                      return (
                        <Card
                          key={submission.id}
                          className="border-muted hover:border-primary/50 transition-colors"
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-start gap-3">
                                <div className="bg-muted flex h-9 w-9 items-center justify-center rounded-lg">
                                  <Code2 className="text-muted-foreground h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{submission.problem.title}</p>
                                  </div>
                                  <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                                    <span>
                                      by {submission.user.name || `User ${submission.user.id}`}
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(submission.createdAt).toLocaleString()}</span>
                                    {isCurrentUser && (
                                      <>
                                        <span>•</span>
                                        <Badge variant="secondary" className="h-5 text-xs">
                                          Your submission
                                        </Badge>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 sm:flex-row-reverse">
                                <Sheet>
                                  <SheetTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="shrink-0 gap-1.5"
                                    >
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
                                <Badge
                                  variant="outline"
                                  className={`gap-1.5 ${statusInfo.className}`}
                                >
                                  <StatusIcon
                                    className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`}
                                  />
                                  {statusInfo.label}
                                </Badge>
                                <Badge variant="secondary" className="font-mono text-xs">
                                  {submission.language}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants ({contest.participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contest.participants.length === 0 ? (
                  <div className="rounded-lg border py-12 text-center">
                    <UserPlus className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                    <p className="text-lg font-medium">No participants yet</p>
                    <p className="text-muted-foreground mt-1 text-sm">Be the first to join!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contest.participants.map((participant, index) => {
                      const isCurrentUser = participant.userId === me?.id;

                      return (
                        <Card
                          key={participant.id}
                          className={`border-2 transition-all hover:shadow-md ${getRankStyle(
                            index
                          )} ${isCurrentUser ? "ring-1 ring-blue-200" : ""}`}
                        >
                          <CardContent className="flex items-center justify-between p-4 sm:p-5">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              {/* Rank Badge */}
                              <div className="relative flex items-center justify-center">
                                {getMedalIcon(index) ? (
                                  <div className="text-2xl">{getMedalIcon(index)}</div>
                                ) : (
                                  <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                                    <span className="text-muted-foreground text-xs font-bold">
                                      {index + 1}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Name and Badge */}
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="text-foreground truncate text-sm font-semibold">
                                  {participant.name}
                                </span>
                                {isCurrentUser && (
                                  <Badge variant="default" className="shrink-0 text-xs">
                                    You
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="text-muted-foreground ml-4 hidden gap-6 text-xs sm:flex">
                              <div className="text-right">
                                <div className="text-foreground font-bold">
                                  {participant.solved}
                                </div>
                                <div>Solved</div>
                              </div>
                              <div className="text-right">
                                <div className="text-foreground font-bold">
                                  {participant.penalty}
                                </div>
                                <div>Penalty</div>
                              </div>
                            </div>

                            {/* Mobile Stats */}
                            <div className="text-muted-foreground flex gap-4 text-xs sm:hidden">
                              <div className="text-right">
                                <div className="text-foreground font-bold">
                                  {participant.solved}
                                </div>
                                <div>Solved</div>
                              </div>
                              <div className="text-right">
                                <div className="text-foreground font-bold">
                                  {participant.penalty}
                                </div>
                                <div>Penalty</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}

const getMedalIcon = (index: number) => {
  if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
  if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
  return null;
};

const getRankStyle = (index: number) => {
  if (index === 0)
    return "bg-gradient-to-r from-yellow-400/10 via-amber-400/5 to-yellow-500/5 dark:from-yellow-500/15 dark:via-amber-500/10 dark:to-yellow-600/10 border-yellow-400/30 dark:border-yellow-500/30"; // gold

  if (index === 1)
    return "bg-gradient-to-r from-blue-100/80 via-sky-100/60 to-blue-100/40 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-sky-900/20 border-sky-300 dark:border-sky-700/50"; // silver (blue tone)

  if (index === 2)
    return "bg-gradient-to-r from-orange-100/80 via-red-100/60 to-orange-100/40 dark:from-orange-950/50 dark:via-red-950/40 dark:to-orange-900/30 border-orange-300 dark:border-orange-700/50"; // bronze

  return "bg-gradient-to-r from-white to-gray-50/80 dark:from-gray-900/40 dark:to-gray-800/30 border-gray-200 dark:border-gray-700";
};
