import { Card, CardHeader, CardContent, CardTitle } from "@web/components/ui/card";
import { Badge } from "@web/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@web/components/ui/collapsible";
import { ChevronDown, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { ExecuteResult, ExecutionSummary } from "@web/lib/tanstack/options/execute";
import { cn } from "@web/lib/utils";

interface Props {
  result?: ExecutionSummary;
}

export const ResultPanel = ({ result }: Props) => {
  if (!result) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="bg-muted rounded-full p-3">
            <Clock className="text-muted-foreground h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">No Results Yet</p>
            <p className="text-muted-foreground text-xs">Run your code to see results</p>
          </div>
        </div>
      </div>
    );
  }

  const getVerdictConfig = (verdict: string) => {
    switch (verdict) {
      case "ACCEPTED":
        return {
          icon: CheckCircle2,
          color: "text-green-600 dark:text-green-400",
          bg: "bg-green-500/10",
          border: "border-green-500/50"
        };
      case "TIME_LIMIT_EXCEEDED":
        return {
          icon: Clock,
          color: "text-yellow-600 dark:text-yellow-400",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/50"
        };
      default:
        return {
          icon: XCircle,
          color: "text-red-600 dark:text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/50"
        };
    }
  };

  const verdictConfig = getVerdictConfig(result.verdict);
  const VerdictIcon = verdictConfig.icon;

  const passedCount = result.totalPassed;
  const totalCount = result.total;

  return (
    <div className="space-y-4">
      {/* Verdict Summary */}
      <Card className={cn("border-2", verdictConfig.border, verdictConfig.bg)}>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className={cn("rounded-full p-2", verdictConfig.bg)}>
              <VerdictIcon className={cn("h-5 w-5", verdictConfig.color)} />
            </div>
            <div>
              <p className={cn("font-semibold", verdictConfig.color)}>{result.verdict}</p>
              <p className="text-muted-foreground text-xs">
                {passedCount} / {totalCount} test cases passed
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn("font-mono", verdictConfig.color, verdictConfig.border)}
          >
            {passedCount}/{totalCount}
          </Badge>
        </CardContent>
      </Card>

      {/* Test Cases */}
      <div className="space-y-2">
        <h3 className="text-muted-foreground text-xs font-medium">Test Cases</h3>
        <div className="space-y-2">
          {result.results.map((res, idx) => (
            <ResultItem key={idx} res={res} idx={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

const ResultItem = ({ res, idx }: { res: ExecuteResult; idx: number }) => {
  const isPassed = res.passed;

  return (
    <Collapsible>
      <Card
        className={cn(
          "transition-colors",
          isPassed
            ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
            : "border-red-500/30 bg-red-500/5 hover:bg-red-500/10"
        )}
      >
        <CollapsibleTrigger className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
            <div className="flex items-center gap-2">
              {isPassed ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <span className="text-sm font-medium">Test Case {idx + 1}</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={isPassed ? "default" : "destructive"}
                className="h-5 text-xs font-medium"
              >
                {isPassed ? "Passed" : "Failed"}
              </Badge>
              <ChevronDown className="text-muted-foreground ui-expanded:rotate-180 h-4 w-4 transition-transform" />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-3 border-t p-3 pt-3">
            <CodeBlock label="Input" code={res.input} />
            <CodeBlock label="Expected" code={res.expected} />
            <CodeBlock label="Output" code={res.output} error={!isPassed} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const CodeBlock = ({ label, code, error }: { label: string; code: string; error?: boolean }) => {
  const display = code?.trim() === "" ? "<empty>" : code;
  const isEmpty = code?.trim() === "";

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
      <div
        className={cn(
          "bg-muted/50 rounded-md border px-3 py-2",
          error && !isEmpty && "border-red-500/30 bg-red-500/5"
        )}
      >
        <pre className="font-mono text-xs leading-relaxed">
          <code className={cn(isEmpty && "text-muted-foreground italic")}>{display}</code>
        </pre>
      </div>
    </div>
  );
};
