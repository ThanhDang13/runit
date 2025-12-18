import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import { ScrollArea } from "@web/components/ui/scroll-area";
import { EditorPreview } from "@web/components/blocks/editor-md/preview";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@web/components/ui/resizable";
import { useTheme } from "@web/components/theme-provider";
import { createGetProblemByIdQueryOptions } from "@web/lib/tanstack/options/problem";
import { Button } from "@web/components/ui/button";
import { SelectLanguage } from "@web/components/runner/select-language";
import { ResultPanel } from "@web/components/runner/result-panel";
import { Card, CardContent, CardFooter } from "@web/components/ui/card";
import { TestcasePanel } from "@web/components/runner/testcase-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@web/components/ui/tabs";
import { toast } from "sonner";
import {
  createExecuteMutationOptions,
  createSubmitMutationOptions,
  ExecutionSummary
} from "@web/lib/tanstack/options/execute";

export const Route = createFileRoute("/_u/problem/$id")({ component: CodeRunner });

export function CodeRunner() {
  const { id } = useParams({ from: "/_u/problem/$id" });
  const { theme } = useTheme();

  const { data: problem, isLoading, error } = useQuery(createGetProblemByIdQueryOptions({ id }));

  const [code, setCode] = useState("// Write your solution here");
  const [language, setLanguage] = useState("python");
  const [result, setResult] = useState<ExecutionSummary>();

  const runMutation = useMutation({
    ...createExecuteMutationOptions(),
    onSuccess: setResult,
    onError: (err) => toast.error(err.message)
  });

  const submitMutation = useMutation({
    ...createSubmitMutationOptions(),
    onSuccess: setResult,
    onError: (err) => toast.error(err.message)
  });

  const handleRun = () => runMutation.mutate({ code, language, problemId: id });

  const handleSubmit = () => submitMutation.mutate({ code, language, problemId: id });

  if (isLoading) return <div className="text-muted-foreground p-6 text-center">Loading...</div>;
  if (error || !problem)
    return <div className="p-6 text-center text-red-500">Failed to load problem</div>;

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full w-full">
      {/* Left: Problem Description */}
      <ResizablePanel defaultSize={60} collapsible className="h-full">
        <ScrollArea className="h-full">
          <div className="h-full space-y-4 overflow-y-visible p-6">
            <div className="flex items-center gap-3">
              <h1 className="text-foreground text-3xl font-bold">{problem.title}</h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  problem.difficulty === "easy"
                    ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300"
                    : problem.difficulty === "medium"
                      ? "border-yellow-500/30 bg-yellow-500/20 text-yellow-300"
                      : "border-red-500/30 bg-red-500/20 text-red-300"
                }`}
              >
                {problem.difficulty.toUpperCase()}
              </span>
            </div>
            <EditorPreview editorSerializedState={JSON.parse(problem.description)} />
          </div>
        </ScrollArea>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right: Editor & Result */}
      <ResizablePanel defaultSize={40} className="h-full">
        <ResizablePanelGroup direction="vertical" className="h-full min-h-[200px] border-0">
          {/* Editor */}
          <ResizablePanel defaultSize={70} className="h-full overflow-hidden rounded-none border-0">
            <Card className="flex h-full flex-col rounded-none border-0">
              <CardContent className="min-h-20 flex-1">
                <Editor
                  className="border-0"
                  height="100%"
                  width="100%"
                  language={language}
                  value={code}
                  onChange={(val) => setCode(val ?? "")}
                  theme={theme === "dark" ? "vs-dark" : "vs"}
                  options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: "on" }}
                />
              </CardContent>
              <CardFooter className="flex flex-wrap items-center justify-between gap-3 p-3">
                {/* Left: Settings */}
                <div className="flex items-center gap-2">
                  <SelectLanguage value={language} onChange={setLanguage} />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleRun}
                    disabled={runMutation.isPending || submitMutation.isPending}
                  >
                    {runMutation.isPending ? "Running…" : "Run"}
                  </Button>

                  <Button
                    variant="default"
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? "Submitting…" : "Submit"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </ResizablePanel>
          <ResizableHandle withHandle />
          {/* Result */}
          <ResizablePanel defaultSize={30} className="h-full overflow-hidden">
            <ResizablePanel defaultSize={30} className="h-full overflow-hidden">
              <Tabs defaultValue="results" className="flex h-full flex-col">
                <TabsList className="grid w-full grid-cols-2 rounded-none">
                  <TabsTrigger value="results">Results</TabsTrigger>
                  <TabsTrigger value="testcases">Testcases</TabsTrigger>
                </TabsList>

                <TabsContent value="results" className="h-full flex-1 overflow-y-auto p-2">
                  <ResultPanel result={result} />
                </TabsContent>

                <TabsContent value="testcases" className="h-full flex-1 overflow-y-auto p-2">
                  <TestcasePanel testcases={problem.testcases} />
                </TabsContent>
              </Tabs>
            </ResizablePanel>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
