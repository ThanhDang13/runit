import { createFileRoute, useParams } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import { Play, Send, Code2, ListChecks, Loader2 } from "lucide-react";

import { ScrollArea } from "@web/components/ui/scroll-area";
import { EditorPreview } from "@web/components/blocks/editor-md/preview";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@web/components/ui/resizable";
import { useTheme } from "@web/components/theme-provider";
import { createGetProblemByIdQueryOptions } from "@web/lib/tanstack/options/problem";
import { Button } from "@web/components/ui/button";
import { SelectLanguage } from "@web/components/runner/select-language";
import { ResultPanel } from "@web/components/runner/result-panel";
import { Card, CardContent, CardFooter, CardHeader } from "@web/components/ui/card";
import { TestcasePanel } from "@web/components/runner/testcase-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@web/components/ui/tabs";
import { Badge } from "@web/components/ui/badge";
import { Separator } from "@web/components/ui/separator";
import { toast } from "sonner";
import {
  createExecuteMutationOptions,
  createSubmitMutationOptions,
  ExecuteRequest,
  ExecutionSummary
} from "@web/lib/tanstack/options/execute";
import { ScrollProgress } from "@web/components/ui/scroll-progress";
import TourProvider, { TourStep, TourTrigger } from "@web/components/guided-tour";
import { createMeQueryOptions } from "@web/lib/tanstack/options/auth";

export const Route = createFileRoute("/_u/problem/$id")({ component: CodeRunner });

export function CodeRunner() {
  const { id } = useParams({ from: "/_u/problem/$id" });
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: problem, isLoading, error } = useQuery(createGetProblemByIdQueryOptions({ id }));
  const { data: me } = useQuery({ ...createMeQueryOptions() });

  const [code, setCode] = useState("// Write your solution here");
  const [language, setLanguage] = useState<ExecuteRequest["language"]>("python");
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

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "medium":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "hard":
        return "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "border-gray-500/30 bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="bg-destructive/10 rounded-full p-3">
                <Code2 className="text-destructive h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Problem Not Found</h3>
                <p className="text-muted-foreground text-sm">
                  Unable to load the problem. Please try again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TourProvider
      autoStart={false}
      onTourComplete={() => toast("Runner tour completed")}
      onTourSkip={() => toast("Runner tour skipped")}
    >
      <div className="h-full overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={60} collapsible className="h-full">
            <div className="flex h-full flex-col">
              <ScrollArea ref={containerRef} className="h-full">
                {/* <ScrollProgress
                container={containerRef}
                color="bg-primary"
                height={3}
                className="sticky top-0 right-0 left-0 z-50"
                /> */}
                <div className="space-y-6 p-6">
                  {/* Problem Header */}
                  <TourStep
                    id="problem-description"
                    title="Problem Description"
                    content="Read the problem carefully before writing your solution."
                    order={1}
                    position="right"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <h1 className="text-3xl font-bold tracking-tight">{problem.title}</h1>
                        <Badge
                          variant="outline"
                          className={`shrink-0 ${getDifficultyStyles(problem.difficulty)}`}
                        >
                          {problem.difficulty.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </TourStep>

                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <EditorPreview editorSerializedState={JSON.parse(problem.description)} />
                  </div>
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={40} className="h-full">
            <div className="flex h-full flex-col">
              <div className="bg-muted/30 flex shrink-0 items-center justify-between border-b px-4 py-2">
                <div className="flex items-center gap-2">
                  <Code2 className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground text-xs font-medium">Editor</span>
                </div>

                <div className="flex items-center gap-2">
                  <TourStep
                    id="language-selector"
                    title="Choose Language"
                    content="Select the programming language you want to use."
                    order={2}
                    position="bottom"
                  >
                    <SelectLanguage value={language} onChange={setLanguage} />
                  </TourStep>

                  <Separator orientation="vertical" className="h-6" />

                  <TourTrigger>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                      Guide
                    </Button>
                  </TourTrigger>

                  <TourStep
                    id="run-code"
                    title="Run Code"
                    content="Run your code against sample test cases."
                    order={3}
                    position="bottom"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRun}
                      disabled={runMutation.isPending || submitMutation.isPending}
                      className="h-8 gap-1.5 px-3"
                    >
                      {runMutation.isPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span className="text-xs">Running</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5" />
                          <span className="text-xs">Run</span>
                        </>
                      )}
                    </Button>
                  </TourStep>

                  <TourStep
                    id="submit-code"
                    title="Submit Solution"
                    content="Submit your final solution for evaluation."
                    order={4}
                    position="bottom"
                  >
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={submitMutation.isPending || runMutation.isPending || !me}
                      className="h-8 gap-1.5 px-3"
                    >
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span className="text-xs">Submitting</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          <span className="text-xs">Submit</span>
                        </>
                      )}
                    </Button>
                  </TourStep>
                </div>
              </div>

              <ResizablePanelGroup direction="vertical" className="flex-1">
                <ResizablePanel defaultSize={65} className="overflow-hidden">
                  <div className="h-full">
                    <Editor
                      height="100%"
                      width="100%"
                      language={language}
                      value={code}
                      onChange={(val) => setCode(val ?? "")}
                      theme={theme === "dark" ? "vs-dark" : "vs"}
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        wordWrap: "on",
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        padding: { top: 12, bottom: 12 },
                        lineDecorationsWidth: 8,
                        lineNumbersMinChars: 3
                      }}
                    />
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={35} minSize={6} className="overflow-hidden">
                  <Tabs defaultValue="results" className="bg-muted/20 flex h-full flex-col">
                    <TabsList className="h-9 w-full justify-start rounded-none border-b bg-transparent px-2 py-0">
                      <TabsTrigger
                        value="results"
                        className="data-[state=active]:bg-background h-8 gap-1.5 px-3 text-xs data-[state=active]:shadow-sm"
                      >
                        <ListChecks className="h-3.5 w-3.5" />
                        Results
                      </TabsTrigger>
                      <TabsTrigger
                        value="testcases"
                        className="data-[state=active]:bg-background h-8 gap-1.5 px-3 text-xs data-[state=active]:shadow-sm"
                      >
                        <Code2 className="h-3.5 w-3.5" />
                        Test Cases
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="results" className="mt-0 flex-1 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-4">
                          <ResultPanel result={result} />
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="testcases" className="mt-0 flex-1 overflow-hidden">
                      <ScrollArea className="h-full">
                        <div className="p-4">
                          <TestcasePanel testcases={problem.testcases} />
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TourProvider>
  );
}
