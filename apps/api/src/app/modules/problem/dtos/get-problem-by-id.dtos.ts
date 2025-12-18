import { createZodDto } from "nestjs-zod";
import z from "zod";
import { ProblemWithTestCaseSchema } from "@api/app/modules/problem/dtos/common";

export const GetProblemByIdRequestParamsSchema = z.object({
  id: z.uuid()
});

export class GetProblemByIdRequestParamsDto extends createZodDto(
  GetProblemByIdRequestParamsSchema
) {}

export const GetProblemByIdResponseSchema = ProblemWithTestCaseSchema;

export class GetProblemByIdResponseDto extends createZodDto(GetProblemByIdResponseSchema) {}
