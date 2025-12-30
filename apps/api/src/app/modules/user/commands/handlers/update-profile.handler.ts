import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { UserResponseDto } from "@api/app/modules/user/dtos/user.dtos";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { users } from "@api/app/infrastructure/database/schema";
import { UpdateProfileCommand } from "@api/app/modules/user/commands/update-profile.command";

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<
  UpdateProfileCommand,
  UserResponseDto
> {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}

  async execute(command: UpdateProfileCommand): Promise<UserResponseDto> {
    const { userId, data } = command;
    const now = new Date().toISOString();

    const [updatedUser] = await this.db
      .update(users)
      .set({
        name: data.name,
        // : data.avatarUrl,
        updatedAt: now
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return updatedUser;
  }
}
