import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserCommand } from "@api/app/modules/user/commands/create-user.command";
import { UserResponseDto } from "@api/app/modules/user/dtos/user.dtos";
import { Inject, ConflictException } from "@nestjs/common";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { users } from "@api/app/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { hash } from "@node-rs/argon2";

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, UserResponseDto> {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}

  async execute(command: CreateUserCommand): Promise<UserResponseDto> {
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
        role: data.role,
        passwordHash
      })
      .returning();

    return newUser;
  }
}
