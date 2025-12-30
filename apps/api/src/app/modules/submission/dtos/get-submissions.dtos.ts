import { OffsetPaginatedSchema, OffsetPagingDTOSchema } from "@api/app/common/types/pagination";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import {
  SUBMISSION_STATUSES,
  SubmissionSchema
} from "@api/app/modules/submission/dtos/common.dtos";

export const GetSubmissionsRequestQuerySchema = z
  .object({
    userId: z.string().optional(),
    problemId: z.string().optional(),
    language: z.string().optional(),
    status: z.literal(SUBMISSION_STATUSES).optional()
  })
  .extend(OffsetPagingDTOSchema.shape);

export class GetSubmissionsRequestQueryDto extends createZodDto(GetSubmissionsRequestQuerySchema) {}

export const GetSubmissionsResponseSchema = OffsetPaginatedSchema(SubmissionSchema);

export class GetSubmissionsResponseDto extends createZodDto(GetSubmissionsResponseSchema) {}
