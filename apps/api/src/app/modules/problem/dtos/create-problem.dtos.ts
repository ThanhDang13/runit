import { createZodDto } from "nestjs-zod";
import z from "zod";
import { ProblemSchema, TestcaseSchema } from "@api/app/modules/problem/dtos/common";

export const CreateTestcaseRequestSchema = TestcaseSchema.omit({
  id: true,
  problemId: true,
  createdAt: true,
  updatedAt: true
});

export const CreateProblemRequestBodySchema = ProblemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).extend({
  testcases: z.array(CreateTestcaseRequestSchema).optional()
});

export class CreateProblemRequestBodyDto extends createZodDto(CreateProblemRequestBodySchema) {}

export const CreateProblemResponseSchema = ProblemSchema;

export class CreateProblemResponseDto extends createZodDto(CreateProblemResponseSchema) {}
