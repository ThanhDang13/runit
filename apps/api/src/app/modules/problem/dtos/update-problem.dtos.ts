import { createZodDto } from "nestjs-zod";
import z from "zod";
import { ProblemSchema, TestcaseSchema } from "@api/app/modules/problem/dtos/common";

export const UpdateProblemRequestParamsSchema = z.object({
  id: z.uuid()
});

export class UpdateProblemRequestParamsDto extends createZodDto(UpdateProblemRequestParamsSchema) {}

// export type UpdateProblemRequestParamsType = z.infer<typeof UpdateProblemRequestParamsSchema>;

export const UpdateTestcaseRequestSchema = TestcaseSchema.omit({
  problemId: true,
  createdAt: true,
  updatedAt: true
});

export const UpdateProblemRequestBodySchema = ProblemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})
  .partial()
  .extend({
    testcases: z.array(UpdateTestcaseRequestSchema.partial()).optional()
  });

export class UpdateProblemRequestBodyDto extends createZodDto(UpdateProblemRequestBodySchema) {}

// export type UpdateProblemRequestBodyType = z.infer<typeof UpdateProblemRequestBodySchema>;

export const UpdateProblemResponseSchema = ProblemSchema;

export class UpdateProblemResponseDto extends createZodDto(UpdateProblemResponseSchema) {}

// export type UpdateProblemResponseType = z.infer<typeof UpdateProblemResponseSchema>;
