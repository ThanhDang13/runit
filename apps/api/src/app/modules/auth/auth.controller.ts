import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ZodResponse } from "nestjs-zod";
import { LoginCommand } from "@api/app/modules/auth/commands/login.command";
import { SignupCommand } from "@api/app/modules/auth/commands/signup.command";
import {
  AuthResponseDto,
  ForgotPasswordRequestBodyDto,
  LoginRequestBodyDto,
  ResendVerificationRequestBodyDto,
  ResetPasswordRequestBodyDto,
  SignupRequestBodyDto,
  TokenPayloadResponseDto,
  VerifyEmailRequestBodyDto
} from "@api/app/modules/auth/dtos/auth.dtos";
import { FastifyRequest } from "fastify";
import { IsUser } from "@api/app/modules/auth/strategy/role.guard";
import { ChangePasswordRequestBodyDto } from "@api/app/modules/user/dtos/change-password.dtos";
import { ChangePasswordCommand } from "@api/app/modules/user/commands/change-password.command";
import { ForgotPasswordCommand } from "@api/app/modules/auth/commands/forgot-password.command";
import { ResetPasswordCommand } from "@api/app/modules/auth/commands/reset-password.command";
import { MessageResponseDto } from "@api/app/common/types/common";
import { VerifyEmailCommand } from "@api/app/modules/auth/commands/verify-email.command";
import { ResendVerificationCommand } from "@api/app/modules/auth/commands/resend-verification.command";

@Controller("v1/auth")
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post("login")
  @ZodResponse({ type: AuthResponseDto })
  async login(@Body() body: LoginRequestBodyDto): Promise<AuthResponseDto> {
    return this.commandBus.execute(new LoginCommand(body));
  }

  @Post("signup")
  @ZodResponse({ type: MessageResponseDto })
  async signup(@Body() body: SignupRequestBodyDto): Promise<MessageResponseDto> {
    return this.commandBus.execute(new SignupCommand(body));
  }

  @Post("verify-email")
  @ZodResponse({ type: MessageResponseDto })
  async verifyEmail(@Body() body: VerifyEmailRequestBodyDto) {
    return this.commandBus.execute(new VerifyEmailCommand(body.token));
  }

  @Post("resend-verification")
  async resendVerification(@Body() body: ResendVerificationRequestBodyDto) {
    return this.commandBus.execute(new ResendVerificationCommand(body.email));
  }

  @Get("me")
  @IsUser()
  @ZodResponse({ type: TokenPayloadResponseDto })
  getMe(@Req() req: FastifyRequest) {
    return req.user;
  }

  @Post("change-password")
  @IsUser()
  async changePassword(@Req() req: FastifyRequest, @Body() body: ChangePasswordRequestBodyDto) {
    await this.commandBus.execute(
      new ChangePasswordCommand(req.user.id, body.currentPassword, body.newPassword)
    );

    return { success: true };
  }

  @Post("forgot-password")
  async forgotPassword(@Body() body: ForgotPasswordRequestBodyDto) {
    await this.commandBus.execute(new ForgotPasswordCommand(body.email));
    return { success: true };
  }

  @Post("reset-password")
  async resetPassword(@Body() body: ResetPasswordRequestBodyDto) {
    await this.commandBus.execute(new ResetPasswordCommand(body.email, body.pin, body.newPassword));
    return { success: true };
  }
}
