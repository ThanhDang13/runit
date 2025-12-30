import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const UpdateProfileRequestBodySchema = z.object({
  name: z.string().min(1).optional()
  //   avatarUrl: z.string().url().optional()
});

export class UpdateProfileRequestBodyDto extends createZodDto(UpdateProfileRequestBodySchema) {}
