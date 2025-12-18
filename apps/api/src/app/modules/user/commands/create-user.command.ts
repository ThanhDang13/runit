import { CreateUserRequestBodyDto, UserResponseDto } from "@api/app/modules/user/dtos/user.dtos";
import { Command } from "@nestjs/cqrs";

export class CreateUserCommand extends Command<UserResponseDto> {
  constructor(public readonly data: CreateUserRequestBodyDto) {
    super();
  }
}
