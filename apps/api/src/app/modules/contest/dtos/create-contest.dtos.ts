import { ContestSchema } from "@api/app/modules/contest/dtos/common";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const CreateContestRequestBodySchema = ContestSchema.pick({
  title: true,
  description: true,
  startTime: true,
  endTime: true
});

export class CreateContestRequestDto extends createZodDto(CreateContestRequestBodySchema) {}

export const CreateContestResponseSchema = ContestSchema.omit({
  participants: true,
  problems: true
}).extend({
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});

export class CreateContestResponseDto extends createZodDto(CreateContestResponseSchema) {}
