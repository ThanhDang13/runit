import { IsUser } from "@api/app/modules/auth/strategy/role.guard";
import { UpdateProfileCommand } from "@api/app/modules/user/commands/update-profile.command";
import { UpdateProfileRequestBodyDto } from "@api/app/modules/user/dtos/profile.dtos";
import { UserResponseDto } from "@api/app/modules/user/dtos/user.dtos";
import { GetUserByIdQuery } from "@api/app/modules/user/queries/get-user-by-id.query";
import { User } from "@api/app/modules/user/queries/types";
import { Body, Controller, Get, Put, Req } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { FastifyRequest } from "fastify";
import { ZodResponse } from "nestjs-zod";

@Controller("v1/profile")
@IsUser()
export class ProfileController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @Get()
  @ZodResponse({ type: UserResponseDto })
  async getProfile(@Req() req: FastifyRequest): Promise<Omit<User, "passwordHash">> {
    return this.queryBus.execute(new GetUserByIdQuery(req.user.id));
  }

  @Put()
  @IsUser()
  @ZodResponse({ type: UserResponseDto })
  async updateProfile(
    @Req() req: FastifyRequest,
    @Body() body: UpdateProfileRequestBodyDto
  ): Promise<Omit<User, "passwordHash">> {
    return this.commandBus.execute(new UpdateProfileCommand(req.user.id, body));
  }
}
