import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, ForbiddenException, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { hash, verify } from "@node-rs/argon2";

import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { users } from "@api/app/infrastructure/database/schema";
import { ChangePasswordCommand } from "@api/app/modules/user/commands/change-password.command";

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand, void> {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const { userId, currentPassword, newPassword } = command;

    const [user] = await this.db
      .select({
        id: users.id,
        passwordHash: users.passwordHash
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.passwordHash) {
      throw new NotFoundException("User not found");
    }

    const isValid = await verify(user.passwordHash, currentPassword);
    if (!isValid) {
      throw new ForbiddenException("Current password is incorrect");
    }

    const newPasswordHash = await hash(newPassword);

    await this.db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userId));
  }
}
