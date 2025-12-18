import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateUserCommand } from "@api/app/modules/user/commands/update-user.command";
import { UserResponseDto } from "@api/app/modules/user/dtos/user.dtos";
import { Inject, NotFoundException } from "@nestjs/common";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { users } from "@api/app/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { hash } from "@node-rs/argon2";

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, UserResponseDto> {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}

  async execute(command: UpdateUserCommand): Promise<UserResponseDto> {
    const { userId, data } = command;
    const now = new Date().toISOString();

    let passwordHash: string | undefined;
    if (data.password) {
      passwordHash = await hash(data.password);
    }

    const [updatedUser] = await this.db
      .update(users)
      .set({
        name: data.name,
        email: data.email,
        role: data.role,
        passwordHash: passwordHash || undefined,
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
