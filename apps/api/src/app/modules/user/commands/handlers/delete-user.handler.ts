import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteUserCommand } from "@api/app/modules/user/commands/delete-user.command";
import { Inject, NotFoundException } from "@nestjs/common";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { users } from "@api/app/infrastructure/database/schema";
import { eq } from "drizzle-orm";

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand, { id: string }> {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}

  async execute(command: DeleteUserCommand): Promise<{ id: string }> {
    const { userId } = command;

    const [deleted] = await this.db.delete(users).where(eq(users.id, userId)).returning();

    if (!deleted) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return { id: userId };
  }
}
