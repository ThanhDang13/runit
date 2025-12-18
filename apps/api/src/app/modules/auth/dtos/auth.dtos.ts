import { createZodDto } from "nestjs-zod";
import z from "zod";

export const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  role: z.union([z.literal("user"), z.literal("admin")]).default("user"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});

export const TokenPayloadSchema = UserSchema.pick({
  id: true,
  email: true,
  name: true,
  role: true
});

export const LoginRequestBodySchema = z.object({
  email: z.email(),
  password: z.string()
});

export class LoginRequestBodyDto extends createZodDto(LoginRequestBodySchema) {}

export const SignupRequestBodySchema = z.object({
  name: z.string().min(3),
  email: z.email(),
  password: z.string().min(8)
});

export class SignupRequestBodyDto extends createZodDto(SignupRequestBodySchema) {}

export const AuthResponseSchema = z.object({
  accessToken: z.string()
});

export class TokenPayloadResponseDto extends createZodDto(TokenPayloadSchema) {}

export class AuthResponseDto extends createZodDto(AuthResponseSchema) {}
