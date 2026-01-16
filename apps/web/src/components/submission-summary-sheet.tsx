import { Link } from "@tanstack/react-router";
import { Calendar, CheckCircle2, Clock, Code, XCircle } from "lucide-react";

import { Badge } from "@web/components/ui/badge";
import { ScrollArea, ScrollBar } from "@web/components/ui/scroll-area";
import { Separator } from "@web/components/ui/separator";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@web/components/ui/collapsible";
import { SheetHeader, SheetTitle } from "@web/components/ui/sheet";
import { Submission } from "@web/lib/tanstack/options/submission";

import { AlertCircle, CheckCheck, FileCode } from "lucide-react";
import { normalizeMultiline } from "@web/lib/utils";

export function SubmissionSummarySheet({
  submission,
  isCurrentUser
}: {
  submission: Submission;
  isCurrentUser: boolean;
}) {
  const isAccepted = submission.status === "accepted";
  const { summary, code, language, problem, createdAt, id } = submission;

  const statusConfig = {
    accepted: {
      label: "Accepted",
      variant: "default" as const,
      icon: CheckCircle2,
      color: "text-green-600"
    },
    wrong_answer: {
      label: "Wrong Answer",
      variant: "destructive" as const,
      icon: XCircle,
      color: "text-red-600"
    },
    time_limit_exceeded: {
      label: "Time Limit Exceeded",
      variant: "destructive" as const,
      icon: Clock,
      color: "text-orange-600"
    },
    runtime_error: {
      label: "Runtime Error",
      variant: "destructive" as const,
      icon: AlertCircle,
      color: "text-red-600"
    },
    compilation_error: {
      label: "Compilation Error",
      variant: "destructive" as const,
      icon: AlertCircle,
      color: "text-red-600"
    },
    pending: {
      label: "Pending",
      variant: "secondary" as const,
      icon: Clock,
      color: "text-gray-600"
    }
  };

  const config = statusConfig[submission.status];
  const StatusIcon = config.icon;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      javascript: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      python: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      java: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      cpp: "bg-purple-500/10 text-purple-700 border-purple-500/20",
      c: "bg-gray-500/10 text-gray-700 border-gray-500/20",
      rust: "bg-red-500/10 text-red-700 border-red-500/20",
      go: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20"
    };
    return colors[lang.toLowerCase()] || "bg-gray-500/10 text-gray-700 border-gray-500/20";
  };

  return (
    <div className="bg-background flex h-full flex-col">
      <ScrollArea className="h-full flex-1">
        {/* Header */}
        <SheetHeader className="border-border/40 from-card to-card/50 border-b bg-linear-to-b p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <SheetTitle className="text-2xl font-semibold tracking-tight">
                  <Link
                    to="/problem/$id"
                    params={{ id: problem.id }}
                    className="underline-offset-4 hover:underline"
                  >
                    {problem.title}
                  </Link>
                </SheetTitle>
                <p className="text-muted-foreground font-mono text-sm">
                  Submission #{id.slice(0, 8)}
                </p>
                {isCurrentUser && (
                  <Badge
                    variant="outline"
                    className="border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  >
                    Your Submission
                  </Badge>
                )}
              </div>

              <Badge variant={config.variant} className="h-9 px-4 text-sm font-medium shadow-sm">
                <StatusIcon className="mr-2 h-4 w-4" />
                {config.label}
              </Badge>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">Submitted:</span>
                <span className="font-medium">{formatDate(createdAt)}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <FileCode className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">Language:</span>
                <Badge
                  variant="outline"
                  className={`text-xs font-medium ${getLanguageColor(language)}`}
                >
                  {language.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Test Results Summary */}
            <div
              className={`rounded-lg border p-4 ${
                isAccepted ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isAccepted ? (
                    <CheckCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">
                      {summary.totalPassed} / {summary.total} Test Cases Passed
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {isAccepted
                        ? "All test cases passed successfully"
                        : `${summary.total - summary.totalPassed} test case${summary.total - summary.totalPassed > 1 ? "s" : ""} failed`}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-2xl font-bold ${isAccepted ? "text-green-600" : "text-red-600"}`}
                >
                  {Math.round((summary.totalPassed / summary.total) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="space-y-4 p-6">
          {/* Submitted Code Section */}
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger className="group border-border/40 bg-card hover:bg-accent/50 flex w-full items-center justify-between rounded-lg border px-4 py-3.5 text-sm font-medium transition-colors">
              <div className="flex items-center gap-2.5">
                <Code className="text-muted-foreground h-4 w-4" />
                <span>View Submitted Code</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {code ? `${code.split("\n").length} lines` : "Hidden"}
                </Badge>
              </div>
              <svg
                className="text-muted-foreground h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3">
              <div className="border-border/40 bg-muted/30 overflow-x-auto rounded-lg border p-4">
                <pre className="font-mono text-xs leading-relaxed">
                  <code>{code ?? "// Code is hidden"}</code>
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator className="my-6" />

          {/* Test Cases Section */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              Test Cases
              <Badge variant="secondary" className="text-xs">
                {summary.total}
              </Badge>
            </h3>

            <div className="space-y-3">
              {summary.results.map((result, idx) => (
                <Collapsible key={idx} defaultOpen={!result.passed}>
                  <CollapsibleTrigger
                    className="group hover:bg-accent/50 data-[state=open]:bg-accent/30 flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors"
                    style={{
                      borderColor: result.passed ? "rgb(34 197 94 / 0.2)" : "rgb(239 68 68 / 0.2)",
                      backgroundColor: result.passed
                        ? "rgb(34 197 94 / 0.05)"
                        : "rgb(239 68 68 / 0.05)"
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      {result.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>Test Case #{idx + 1}</span>
                      <Badge
                        variant={result.passed ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {result.passed ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                    <svg
                      className="text-muted-foreground h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-3">
                    <div className="border-border/40 bg-card space-y-4 rounded-lg border p-4">
                      <div>
                        <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                          Input
                        </div>
                        <ScrollArea>
                          <pre className="border-border/40 bg-muted/50 overflow-x-auto rounded-md border p-3 font-mono text-xs leading-relaxed">
                            {normalizeMultiline(result.input)}
                          </pre>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                            Expected Output
                          </div>
                          <ScrollArea>
                            <pre className="border-border/40 bg-muted/50 overflow-x-auto rounded-md border p-3 font-mono text-xs leading-relaxed">
                              {normalizeMultiline(result.expected)}
                            </pre>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </div>

                        <div>
                          <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                            Output
                          </div>
                          <ScrollArea>
                            <pre
                              className="overflow-x-auto rounded-md border p-3 font-mono text-xs leading-relaxed"
                              style={{
                                borderColor: result.passed
                                  ? "rgb(34 197 94 / 0.3)"
                                  : "rgb(239 68 68 / 0.3)",
                                backgroundColor: result.passed
                                  ? "rgb(34 197 94 / 0.1)"
                                  : "rgb(239 68 68 / 0.1)"
                              }}
                            >
                              {normalizeMultiline(result.output)}
                            </pre>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
