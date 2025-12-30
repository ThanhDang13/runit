import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const JoinContestResponseSchema = z.object({
  id: z.string(),
  contestId: z.string(),
  userId: z.string(),
  joinedAt: z.iso.datetime()
});

export class JoinContestResponseDto extends createZodDto(JoinContestResponseSchema) {}
