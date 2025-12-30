import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import { ContestSchema } from "./common";

export const UpdateContestRequestBodySchema = ContestSchema.pick({
  title: true,
  description: true,
  startTime: true,
  endTime: true
}).partial();

export class UpdateContestRequestDto extends createZodDto(UpdateContestRequestBodySchema) {}

export const UpdateContestResponseSchema = ContestSchema.omit({
  participants: true,
  problems: true
}).extend({
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});

export class UpdateContestResponseDto extends createZodDto(UpdateContestResponseSchema) {}
