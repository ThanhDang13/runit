import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ZodResponse } from "nestjs-zod";
import { LoginCommand } from "@api/app/modules/auth/commands/login.command";
import { SignupCommand } from "@api/app/modules/auth/commands/signup.command";
import {
  AuthResponseDto,
  LoginRequestBodyDto,
  SignupRequestBodyDto,
  TokenPayloadResponseDto
} from "@api/app/modules/auth/dtos/auth.dtos";
import { FastifyRequest } from "fastify";
import { IsUser } from "@api/app/modules/auth/strategy/role.guard";

@Controller("v1/auth")
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post("login")
  @ZodResponse({ type: AuthResponseDto })
  async login(@Body() body: LoginRequestBodyDto): Promise<AuthResponseDto> {
    return this.commandBus.execute(new LoginCommand(body));
  }

  @Post("signup")
  @ZodResponse({ type: AuthResponseDto })
  async signup(@Body() body: SignupRequestBodyDto): Promise<AuthResponseDto> {
    return this.commandBus.execute(new SignupCommand(body));
  }

  @Get("me")
  @IsUser()
  @ZodResponse({ type: TokenPayloadResponseDto })
  getMe(@Req() req: FastifyRequest) {
    return req.user;
  }
}
