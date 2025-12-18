import { OffsetPaginated } from "@api/app/common/types/pagination";
import { CreateUserCommand } from "@api/app/modules/user/commands/create-user.command";
import { DeleteUserCommand } from "@api/app/modules/user/commands/delete-user.command";
import { UpdateUserCommand } from "@api/app/modules/user/commands/update-user.command";
import {
  CreateUserRequestBodyDto,
  GetUserByIdRequestParamsDto,
  GetUsersRequestQueryDto,
  GetUsersResponseDto,
  UpdateUserRequestBodyDto,
  UpdateUserRequestParamsDto,
  UserResponseDto
} from "@api/app/modules/user/dtos/user.dtos";
import { GetUserByIdQuery } from "@api/app/modules/user/queries/get-user-by-id.query";
import { GetUsersQuery } from "@api/app/modules/user/queries/get-users.query";
import { User } from "@api/app/modules/user/queries/types";
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ZodResponse } from "nestjs-zod";

@Controller("v1/users")
export class UserController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @Post()
  @ZodResponse({ type: UserResponseDto })
  async createUser(@Body() body: CreateUserRequestBodyDto): Promise<Omit<User, "passwordHash">> {
    return this.commandBus.execute(new CreateUserCommand(body));
  }

  @Get(":id")
  @ZodResponse({ type: UserResponseDto })
  async getUserById(
    @Param() params: GetUserByIdRequestParamsDto
  ): Promise<Omit<User, "passwordHash">> {
    return this.queryBus.execute(new GetUserByIdQuery(params.id));
  }

  @Get()
  @ZodResponse({ type: GetUsersResponseDto })
  async getUsers(
    @Query() query: GetUsersRequestQueryDto
  ): Promise<OffsetPaginated<Omit<User, "passwordHash">>> {
    const paging = {
      type: query.type,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      order: query.order
    };
    return this.queryBus.execute(new GetUsersQuery(paging, query.keyword));
  }

  @Put(":id")
  @ZodResponse({ type: UserResponseDto })
  async updateUser(
    @Param() params: UpdateUserRequestParamsDto,
    @Body() body: UpdateUserRequestBodyDto
  ): Promise<Omit<User, "passwordHash">> {
    return this.commandBus.execute(new UpdateUserCommand(params.id, body));
  }

  @Delete(":id")
  // @ZodResponse({ type: UserResponseDto })
  async deleteUser(@Param() params: GetUserByIdRequestParamsDto): Promise<{ id: string }> {
    return this.commandBus.execute(new DeleteUserCommand(params.id));
  }
}
