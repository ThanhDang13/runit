import { ScrollArea } from "@web/components/ui/scroll-area";
import { Card, CardHeader, CardContent, CardTitle } from "@web/components/ui/card";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@web/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ExecuteResult, ExecutionSummary } from "@web/lib/tanstack/options/execute";

interface Props {
  result?: ExecutionSummary;
}

export const ResultPanel = ({ result }: Props) => {
  if (!result) {
    return (
      <ScrollArea className="bg-card h-full w-full p-4">
        <div className="text-muted-foreground flex h-full items-center justify-center text-center">
          Run code to test against cases...
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="bg-card h-full w-full p-4">
      <div className="min-h-full space-y-4">
        <div
          className={`rounded-md border p-4 text-sm font-semibold ${
            result.verdict === "ACCEPTED"
              ? "border-green-500 bg-green-50/10 text-green-500"
              : result.verdict === "TIME_LIMIT_EXCEEDED"
                ? "border-yellow-500 bg-yellow-50/10 text-yellow-500"
                : "border-red-500 bg-red-50/10 text-red-500"
          }`}
        >
          {result.verdict}
        </div>
        <div className="space-y-3">
          {result.results.map((res, idx) => (
            <ResultItem key={idx} res={res} idx={idx} />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

const ResultItem = ({ res, idx }: { res: ExecuteResult; idx: number }) => {
  return (
    <Collapsible>
      <Card
        className={`shadow-sm transition-all duration-200 ${
          res.passed
            ? "border-green-500 bg-green-50/10 hover:bg-green-50/20"
            : "border-red-500 bg-red-50/10 hover:bg-red-50/20"
        }`}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="group flex cursor-pointer flex-row items-center justify-between p-4 select-none">
            <CardTitle className={`text-md ${res.passed ? "text-green-400" : "text-red-400"}`}>
              Test Case #{idx + 1}
            </CardTitle>

            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className={res.passed ? "text-green-500" : "text-red-500"}>
                {res.passed ? "Passed" : "Failed"}
              </span>
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-3 p-4 pt-0">
            {<CodeBlock label="Input" code={res.input} />}
            {<CodeBlock label="Expected" code={res.expected} />}
            <CodeBlock label="Output" code={res.output} />
            {/* <CodeBlock label="Exit Code" code={String(res.exitCode)} /> */}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const CodeBlock = ({ label, code }: { label: string; code: string }) => {
  const display = code?.trim() === "" ? "<no output>" : code;

  return (
    <div>
      <strong className="text-foreground mb-1 block">{label}:</strong>
      <code className="bg-muted relative block px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold whitespace-pre-wrap">
        {display}
      </code>
    </div>
  );
};
