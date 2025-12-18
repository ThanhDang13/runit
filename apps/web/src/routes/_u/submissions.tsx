import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@web/components/ui/select";
import { Badge } from "@web/components/ui/badge";
import { Button } from "@web/components/ui/button";
import { Separator } from "@web/components/ui/separator";

import { createGetSubmissionsInfiniteQueryOptions } from "@web/lib/tanstack/options/submission";

export const Route = createFileRoute("/_u/submissions")({
  component: SubmissionsPage
});

function SubmissionsPage() {
  const [language, setLanguage] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [problemId, setProblemId] = useState<string | undefined>();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    createGetSubmissionsInfiniteQueryOptions({
      page: 1,
      limit: 10,
      sort: "createdAt",
      order: "desc",
      language,
      status,
      problemId
    })
  );

  const submissions = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">My Submissions</h1>
        <p className="text-muted-foreground text-sm">View and filter all your submission history</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Problem (placeholder – replace with Command later) */}
        <Select onValueChange={setProblemId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Problem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a57023a3-faf6-41d2-b179-318ad83e55cc">Two Sum</SelectItem>
          </SelectContent>
        </Select>

        {/* Language */}
        <Select onValueChange={setLanguage}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="javascript">Javascript</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="runtime_error">Runtime Error</SelectItem>
            <SelectItem value="wrong_answer">Wrong Answer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* List */}
      {isLoading ? (
        <div className="text-muted-foreground">Loading submissions…</div>
      ) : submissions.length === 0 ? (
        <div className="text-muted-foreground">No submissions found.</div>
      ) : (
        <div className="divide-y rounded-md border">
          {submissions.map((s) => (
            <div
              key={s.id}
              className="hover:bg-muted/50 flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-start gap-3">
                {s.status === "accepted" ? (
                  <CheckCircle className="mt-1 h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="mt-1 h-5 w-5 text-red-500" />
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.summary.verdict}</span>
                    <Badge variant="secondary">{s.language}</Badge>
                  </div>

                  <div className="text-muted-foreground text-sm">
                    {s.problem.title} · {new Date(s.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <Button variant="ghost" size="sm">
                View
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
