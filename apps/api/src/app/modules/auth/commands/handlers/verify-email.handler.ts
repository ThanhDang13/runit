import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { users } from "@api/app/infrastructure/database/schema";
import { VerifyEmailCommand } from "@api/app/modules/auth/commands/verify-email.command";
import { BadRequestException, Inject } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { hash } from "@node-rs/argon2";
import Redis from "ioredis";

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
  constructor(
    @Inject("PG") private readonly db: PGDatabase,
    @Inject("REDIS") private readonly redis: Redis
  ) {}

  async execute(command: VerifyEmailCommand) {
    const { token } = command;

    const userData = await this.redis.get(`signup:${token}`);
    if (!userData) throw new BadRequestException("Invalid or expired token");

    const { name, email, password } = JSON.parse(userData);

    const passwordHash = await hash(password);

    await this.db.insert(users).values({ name, email, passwordHash });

    await this.redis.del(`signup:${token}`);

    return { message: "Email verified! You can now log in." };
  }
}
