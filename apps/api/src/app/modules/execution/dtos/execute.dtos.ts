import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const ExecuteRequestBodySchema = z.object({
  problemId: z.uuid(),
  language: z.enum(["python", "javascript", "cpp", "java"]),
  code: z.string()
});

export class ExecuteRequestDto extends createZodDto(ExecuteRequestBodySchema) {}

export const PassResultSchema = z.object({
  input: z.string(),
  output: z.string(),
  expected: z.string(),
  passed: z.boolean()
});

export const PassSummarySchema = z.object({
  verdict: z.string(),
  total: z.number(),
  totalPassed: z.number(),
  results: z.array(PassResultSchema)
});

export class ExecuteResponseDto extends createZodDto(PassSummarySchema) {}
