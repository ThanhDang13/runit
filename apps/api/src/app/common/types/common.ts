import { createZodDto } from "nestjs-zod";
import z from "zod";

// Note zod v4 already has this so you can use it, they are the same
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export const MessageResponseSchema = z.object({
  message: z.string()
});

export class MessageResponseDto extends createZodDto(MessageResponseSchema) {}
