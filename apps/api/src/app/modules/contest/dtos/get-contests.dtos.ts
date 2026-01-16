import { OffsetPaginatedSchema, OffsetPagingDTOSchema } from "@api/app/common/types/pagination";
import { ContestSchema } from "@api/app/modules/contest/dtos/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";

export const GetContestsRequestQuerySchema = OffsetPagingDTOSchema.extend(
  z.object({
    keyword: z.string().optional()
  }).shape
);

export class GetContestsRequestQueryDto extends createZodDto(GetContestsRequestQuerySchema) {}

export class GetContestResponseDto extends createZodDto(ContestSchema) {}

export const GetContestsResponseSchema = OffsetPaginatedSchema(
  z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime()
  })
);

export class GetContestsResponseDto extends createZodDto(GetContestsResponseSchema) {}
