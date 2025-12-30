/* eslint-disable @nx/enforce-module-boundaries */
import { UseMutationOptions } from "@tanstack/react-query";
import { axiosInstance } from "@web/lib/axios";
import type {
  ExecuteRequestDto,
  ExecuteResponseDto
} from "@api/app/modules/execution/dtos/execute.dtos";
import { Prettify } from "@api/app/common/types/common";
export type ExecuteRequest = Prettify<ExecuteRequestDto>;

export type ExecuteResult = ExecuteResponseDto["results"][number];

export type ExecutionSummary = Prettify<ExecuteResponseDto>;

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
