import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const ChangePasswordRequestBodySchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8)
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"]
  });

export class ChangePasswordRequestBodyDto extends createZodDto(ChangePasswordRequestBodySchema) {}
