import { createZodDto } from "nestjs-zod";
import z, { email } from "zod";

export const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  role: z.union([z.literal("user"), z.literal("admin")]).default("user"),
  active: z.boolean().default(false),
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

export const VerifyEmailRequestBodySchema = z.object({
  token: z.string()
});

export class VerifyEmailRequestBodyDto extends createZodDto(VerifyEmailRequestBodySchema) {}

export const ResendVerificationRequestBodySchema = z.object({
  email: z.email()
});

export class ResendVerificationRequestBodyDto extends createZodDto(
  ResendVerificationRequestBodySchema
) {}

export const AuthResponseSchema = z.object({
  accessToken: z.string()
});

export class TokenPayloadResponseDto extends createZodDto(TokenPayloadSchema) {}

export class AuthResponseDto extends createZodDto(AuthResponseSchema) {}

export const ForgotPasswordRequestBodySchema = z.object({
  email: z.email()
});

export class ForgotPasswordRequestBodyDto extends createZodDto(ForgotPasswordRequestBodySchema) {}

export const ResetPasswordRequestBodySchema = z.object({
  email: z.email(),
  pin: z.string().length(6),
  newPassword: z.string().min(8)
});

export class ResetPasswordRequestBodyDto extends createZodDto(ResetPasswordRequestBodySchema) {}
