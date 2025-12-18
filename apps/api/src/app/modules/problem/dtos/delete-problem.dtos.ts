import { createZodDto } from "nestjs-zod";
import z from "zod";

export const DeleteProblemRequestParamsSchema = z.object({
  id: z.uuid()
});

export class DeleteProblemRequestParamsDto extends createZodDto(DeleteProblemRequestParamsSchema) {}

export const DeleteProblemResponseSchema = z.object({
  id: z.uuid()
});

export class DeleteProblemResponseDto extends createZodDto(DeleteProblemResponseSchema) {}
