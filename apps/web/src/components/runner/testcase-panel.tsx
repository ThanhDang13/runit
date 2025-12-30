import { Card, CardContent } from "@web/components/ui/card";
import { Badge } from "@web/components/ui/badge";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from "@web/components/ui/collapsible";
import { ChevronDown, FileCode, Sparkles } from "lucide-react";
import { cn } from "@web/lib/utils";

import { ProblemWithTestcases } from "@web/lib/tanstack/options/problem";

type Testcase = ProblemWithTestcases["testcases"][number];

export function TestcasePanel({ testcases }: { testcases: Testcase[] }) {
  const sampleCount = testcases.filter((tc) => tc.isSample).length;
  const hiddenCount = testcases.length - sampleCount;

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="text-muted-foreground h-4 w-4" />
          <h3 className="text-sm font-semibold">Test Cases</h3>
          <Badge variant="secondary" className="h-5 text-xs font-normal">
            {testcases.length} total
          </Badge>
        </div>

        {sampleCount > 0 && (
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Sparkles className="h-3 w-3" />
            <span>{sampleCount} sample</span>
          </div>
        )}
      </div>

      {/* Test Cases List */}
      <div className="space-y-2">
        {testcases.map((tc, idx) => (
          <TestcaseItem key={tc.id} index={idx + 1} tc={tc} />
        ))}
      </div>
    </div>
  );
}

function TestcaseItem({ tc, index }: { tc: Testcase; index: number }) {
  return (
    <Collapsible>
      <Card
        className={cn(
          "transition-colors",
          tc.isSample ? "border-primary/30 bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"
        )}
      >
        <CollapsibleTrigger className="w-full">
          <CardContent className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <span className="bg-muted flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
                {index}
              </span>
              <span className="text-sm font-medium">Test Case {index}</span>
              {tc.isSample && (
                <Badge variant="default" className="h-5 gap-1 text-xs font-medium">
                  <Sparkles className="h-3 w-3" />
                  Sample
                </Badge>
              )}
            </div>

            <ChevronDown className="text-muted-foreground ui-expanded:rotate-180 h-4 w-4 transition-transform" />
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-3 border-t p-3">
            <Block label="Input" value={tc.input} />
            <Block label="Expected Output" value={tc.expectedOutput} />
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  const display = value.trim() === "" ? "<empty>" : value;
  const isEmpty = value.trim() === "";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">{label}</span>
        {isEmpty && (
          <Badge variant="outline" className="h-4 text-[10px] font-normal">
            empty
          </Badge>
        )}
      </div>
      <div className="bg-muted/50 rounded-md border px-3 py-2">
        <pre className="font-mono text-xs leading-relaxed">
          <code className={cn(isEmpty && "text-muted-foreground italic")}>{display}</code>
        </pre>
      </div>
    </div>
  );
}
