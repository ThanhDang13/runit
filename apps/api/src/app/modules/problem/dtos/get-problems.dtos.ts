import { OffsetPaginatedSchema, OffsetPagingDTOSchema } from "@api/app/common/types/pagination";
import { ProblemSchema } from "@api/app/modules/problem/dtos/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";

export const GetProblemsRequestQuerySchema = z
  .object({
    keyword: z.string().optional(),
    difficulty: z.string().optional()
  })
  .extend(OffsetPagingDTOSchema.shape);

export class GetProblemsRequestQueryDto extends createZodDto(GetProblemsRequestQuerySchema) {}

export const GetProblemsResponseSchema = OffsetPaginatedSchema(ProblemSchema);

export class GetProblemsResponseDto extends createZodDto(GetProblemsResponseSchema) {}
