import { Prettify } from "zod/v4/core/util.cjs";

export type TestCaseResult = {
  input: string;
  output: string;
  expected: string;
  passed: boolean;
};

export type ExecutionSummary = Prettify<{
  verdict: string;
  total: number;
  totalPassed: number;
  results: TestCaseResult[];
}>;
