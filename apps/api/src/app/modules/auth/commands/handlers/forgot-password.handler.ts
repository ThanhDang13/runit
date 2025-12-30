import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { randomInt } from "crypto";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";

import { users } from "@api/app/infrastructure/database/schema";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { Redis } from "ioredis";
import { ForgotPasswordCommand } from "@api/app/modules/auth/commands/forgot-password.command";
import { Transporter } from "nodemailer";

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
  constructor(
    @Inject("PG") private readonly db: PGDatabase,
    @Inject("REDIS") private readonly redis: Redis,
    @Inject("MAILER") private readonly mailer: Transporter
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<void> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, command.email),
      columns: { id: true, email: true, name: true }
    });

    if (!user) return;

    const pin = randomInt(100000, 999999).toString();
    const pinHash = await hash(pin);

    await this.redis.set(
      `reset-password:${user.id}`,
      JSON.stringify({ pinHash, attempts: 0 }),
      "EX",
      300
    );
    console.log("RESET PIN:", pin);

    await this.mailer.sendMail({
      to: user.email,
      subject: "Reset your RunIT password",
      html: `
        <p>Hi ${user.name ?? "there"},</p>
        <p>Your password reset PIN:</p>
        <h2 style="letter-spacing:2px">${pin}</h2>
        <p>This PIN expires in <b>5 minutes</b>.</p>
        <p>If you didn’t request this, you can ignore this email.</p>
      `
    });
  }
}
