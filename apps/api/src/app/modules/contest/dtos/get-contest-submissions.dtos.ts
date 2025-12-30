import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { OffsetPagingDTOSchema, OffsetPaginatedSchema } from "@api/app/common/types/pagination";
import {
  SUBMISSION_STATUSES,
  SubmissionSchema
} from "@api/app/modules/submission/dtos/common.dtos";

export const GetContestSubmissionsRequestQuerySchema = OffsetPagingDTOSchema.extend({
  language: z.string().optional(),
  status: z.enum(SUBMISSION_STATUSES).optional()
});

export class GetContestSubmissionsRequestQueryDto extends createZodDto(
  GetContestSubmissionsRequestQuerySchema
) {}

export const GetContestSubmissionsResponseSchema = OffsetPaginatedSchema(SubmissionSchema);

export class GetContestSubmissionsResponseDto extends createZodDto(
  GetContestSubmissionsResponseSchema
) {}
