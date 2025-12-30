import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, ForbiddenException } from "@nestjs/common";
import { verify, hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";

import { users } from "@api/app/infrastructure/database/schema";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { Redis } from "ioredis";
import { ResetPasswordCommand } from "@api/app/modules/auth/commands/reset-password.command";

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    @Inject("PG") private readonly db: PGDatabase,
    @Inject("REDIS") private readonly redis: Redis
  ) {}

  async execute(command: ResetPasswordCommand): Promise<void> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, command.email),
      columns: { id: true }
    });

    if (!user) {
      throw new ForbiddenException("Invalid PIN");
    }

    const key = `reset-password:${user.id}`;
    const data = await this.redis.get(key);

    if (!data) {
      throw new ForbiddenException("PIN expired or invalid");
    }

    const parsed = JSON.parse(data);

    if (parsed.attempts >= 5) {
      await this.redis.del(key);
      throw new ForbiddenException("Too many attempts");
    }

    const isValid = await verify(parsed.pinHash, command.pin);
    if (!isValid) {
      parsed.attempts++;
      await this.redis.set(key, JSON.stringify(parsed), "KEEPTTL");
      throw new ForbiddenException("Invalid PIN");
    }

    const newPasswordHash = await hash(command.newPassword);

    await this.db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, user.id));

    await this.redis.del(key);
  }
}
