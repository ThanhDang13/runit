import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SignupCommand } from "@api/app/modules/auth/commands/signup.command";
import { AuthResponseDto } from "@api/app/modules/auth/dtos/auth.dtos";
import { Inject, ConflictException } from "@nestjs/common";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { users } from "@api/app/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { hash } from "@node-rs/argon2";
import { JwtService } from "@nestjs/jwt";

@CommandHandler(SignupCommand)
export class SignupHandler implements ICommandHandler<SignupCommand, AuthResponseDto> {
  constructor(
    @Inject("PG") private readonly db: PGDatabase,
    private readonly jwt: JwtService
  ) {}

  async execute(command: SignupCommand): Promise<AuthResponseDto> {
    const { data } = command;

    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, data.email)
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const passwordHash = await hash(data.password);

    const [newUser] = await this.db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        passwordHash
      })
      .returning();

    const accessToken = this.jwt.sign({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    });

    return {
      accessToken
    };
  }
}
