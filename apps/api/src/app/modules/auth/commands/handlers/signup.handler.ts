import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject, ConflictException, BadRequestException } from "@nestjs/common";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { users } from "@api/app/infrastructure/database/schema";
import { hash } from "@node-rs/argon2";
import { JwtService } from "@nestjs/jwt";
import Redis from "ioredis";
import { Transporter } from "nodemailer";
import { randomBytes } from "crypto";
import { SignupCommand } from "@api/app/modules/auth/commands/signup.command";
import { eq } from "drizzle-orm";
import { env } from "@api/app/infrastructure/config/env.config";

@CommandHandler(SignupCommand)
export class SignupHandler implements ICommandHandler<SignupCommand> {
  constructor(
    @Inject("PG") private readonly db: PGDatabase,
    private readonly jwt: JwtService,
    @Inject("REDIS") private readonly redis: Redis,
    @Inject("MAILER") private readonly mailer: Transporter
  ) {}

  async execute(command: SignupCommand) {
    const { data } = command;

    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, data.email)
    });
    if (existingUser) throw new ConflictException("User with this email already exists");

    const token = randomBytes(32).toString("hex");

    await this.redis.set(`signup:${token}`, JSON.stringify(data), "EX", 24 * 60 * 60);

    const verifyUrl = `${env.SERVER_URL}/verify-email?token=${token}&email=${data.email}`;
    await this.mailer.sendMail({
      to: data.email,
      subject: "Verify your email",
      html: `<p>Hello ${data.name},</p>
             <p>Click <a href="${verifyUrl}">here</a> to complete your registration.</p>`
    });

    return { message: "Verification email sent. Please check your inbox." };
  }
}
