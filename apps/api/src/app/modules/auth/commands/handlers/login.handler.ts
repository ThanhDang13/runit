import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { LoginCommand } from "@api/app/modules/auth/commands/login.command";
import { AuthResponseDto } from "@api/app/modules/auth/dtos/auth.dtos";
import { Inject, UnauthorizedException } from "@nestjs/common";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { users } from "@api/app/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { verify } from "@node-rs/argon2";
import { JwtService } from "@nestjs/jwt";

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, AuthResponseDto> {
  constructor(
    @Inject("PG") private readonly db: PGDatabase,
    private readonly jwt: JwtService
  ) {}

  async execute(command: LoginCommand): Promise<AuthResponseDto> {
    const { data } = command;

    const user = await this.db.query.users.findFirst({
      where: eq(users.email, data.email)
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.active) {
      throw new UnauthorizedException("Your account is inactive");
    }

    const isPasswordValid = await verify(user.passwordHash, data.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessToken = this.jwt.sign({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    return {
      accessToken
    };
  }
}
