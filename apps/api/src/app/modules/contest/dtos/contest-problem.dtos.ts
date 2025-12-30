import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const AddProblemToContestRequestSchema = z.object({
  problemId: z.string(),
  order: z.number().optional()
});

export class AddProblemToContestRequestDto extends createZodDto(AddProblemToContestRequestSchema) {}

export const ContestProblemResponseSchema = z.object({
  id: z.string(),
  contestId: z.string(),
  problemId: z.string(),
  order: z.number()
});

export class AddProblemToContestResponseDto extends createZodDto(ContestProblemResponseSchema) {}
export class RemoveProblemFromContestResponseDto extends createZodDto(
  ContestProblemResponseSchema
) {}
