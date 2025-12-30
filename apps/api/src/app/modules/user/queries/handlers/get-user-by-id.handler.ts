import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserByIdQuery } from "@api/app/modules/user/queries/get-user-by-id.query";
import { UserResponseDto } from "@api/app/modules/user/dtos/user.dtos";
import { Inject, NotFoundException } from "@nestjs/common";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { users } from "@api/app/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { normalizeToIso } from "@api/app/common/helpers/common";

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}

  async execute(query: GetUserByIdQuery): Promise<UserResponseDto> {
    const { userId } = query;

    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return user;
  }
}
