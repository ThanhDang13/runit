import { UseMutationOptions } from "@tanstack/react-query";
import { axiosInstance } from "@web/lib/axios";

export interface ExecuteRequest {
  code: string;
  language: string;
  problemId: string;
}

export interface ExecuteResult {
  input: string;
  output: string;
  passed?: boolean;
  expected: string;
}

export interface ExecutionSummary {
  verdict: string;
  total: number;
  totalPassed: number;
  results: ExecuteResult[];
}

export async function executeCode(payload: ExecuteRequest): Promise<ExecutionSummary> {
  const res = await axiosInstance.post<ExecutionSummary>("/execute", payload);
  return res.data;
}

export const createExecuteMutationOptions = (): UseMutationOptions<
  ExecutionSummary,
  Error,
  ExecuteRequest
> => {
  return {
    mutationKey: ["execute"],
    mutationFn: (payload: ExecuteRequest) => executeCode(payload)
  };
};

export async function submitCode(payload: ExecuteRequest): Promise<ExecutionSummary> {
  const res = await axiosInstance.post<ExecutionSummary>("submissions/submit", payload);
  return res.data;
}

export const createSubmitMutationOptions = (): UseMutationOptions<
  ExecutionSummary,
  Error,
  ExecuteRequest
> => ({
  mutationKey: ["submit"],
  mutationFn: submitCode
});
