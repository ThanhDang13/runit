import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import Redis from "ioredis";
import { Transporter } from "nodemailer";
import { randomBytes } from "crypto";
import { ResendVerificationCommand } from "@api/app/modules/auth/commands/resend-verification.command";
import { env } from "@api/app/infrastructure/config/env.config";

@CommandHandler(ResendVerificationCommand)
export class ResendVerificationHandler implements ICommandHandler<ResendVerificationCommand> {
  constructor(
    @Inject("REDIS") private readonly redis: Redis,
    @Inject("MAILER") private readonly mailer: Transporter
  ) {}

  async execute(command: ResendVerificationCommand) {
    const { email } = command;

    const keys = await this.redis.keys("signup:*");
    let existingKey: string | null = null;

    for (const key of keys) {
      const userData = await this.redis.get(key);
      if (userData && JSON.parse(userData).email === email) {
        existingKey = key;
        break;
      }
    }

    if (!existingKey) {
      throw new NotFoundException("No pending verification found for this email.");
    }

    const token = randomBytes(32).toString("hex");
    const userData = await this.redis.get(existingKey);

    await this.redis.set(`signup:${token}`, userData, "EX", 24 * 60 * 60);
    await this.redis.del(existingKey);

    const verifyUrl = `${env.SERVER_URL}/verify-email?token=${token}&email=${email}`;
    await this.mailer.sendMail({
      to: email,
      subject: "Resend Verification Email",
      html: `<p>Hello,</p>
             <p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`
    });

    return { message: "Verification email resent. Please check your inbox." };
  }
}
