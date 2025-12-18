import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card";
import { Badge } from "@web/components/ui/badge";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from "@web/components/ui/collapsible";
import { Button } from "@web/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

import { ProblemWithTestcases } from "@web/lib/tanstack/options/problem";
import { ScrollArea } from "@web/components/ui/scroll-area";

type Testcase = ProblemWithTestcases["testcases"][number];

export function TestcasePanel({ testcases }: { testcases: Testcase[] }) {
  return (
    <ScrollArea className="bg-card h-full w-full p-4">
      <Card className="h-full rounded-none border-0">
        <CardHeader>
          <CardTitle className="text-lg">Testcases ({testcases.length})</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {testcases.map((tc, idx) => (
            <TestcaseItem key={tc.id} index={idx + 1} tc={tc} />
          ))}
        </CardContent>
      </Card>
    </ScrollArea>
  );
}

function TestcaseItem({ tc, index }: { tc: Testcase; index: number }) {
  return (
    <Collapsible className="rounded-lg border p-3">
      <div className="flex min-h-full items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Testcase {index}</span>
          {tc.isSample && <Badge variant="default">Sample</Badge>}
        </div>

        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="group">
            <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="mt-3 space-y-3">
        <Block label="Input" value={tc.input} />
        <Block label="Expected Output" value={tc.expectedOutput} />
      </CollapsibleContent>
    </Collapsible>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  const display = value.trim() === "" ? "<empty>" : value;

  return (
    <div>
      <div className="mb-1 font-medium">{label}:</div>
      <code className="bg-muted block rounded px-2 py-1 font-mono text-sm whitespace-pre-wrap">
        {display}
      </code>
    </div>
  );
}
