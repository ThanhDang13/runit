import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import {
  PassSummarySchema,
  ExecuteRequestBodySchema as BaseExecuteRequestBodySchema
} from "@api/app/modules/execution/dtos/execute.dtos";

export const SubmitCodeRequestBodySchema = BaseExecuteRequestBodySchema.extend({});

export class SubmitCodeRequestDto extends createZodDto(SubmitCodeRequestBodySchema) {}

export const SubmitCodeResponseSchema = PassSummarySchema;

export class SubmitCodeResponseDto extends createZodDto(SubmitCodeResponseSchema) {}
