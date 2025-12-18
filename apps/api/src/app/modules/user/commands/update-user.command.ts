import { UpdateUserRequestBodyDto, UpdateUserRequestParamsDto, UserResponseDto } from "@api/app/modules/user/dtos/user.dtos";
import { Command } from "@nestjs/cqrs";

export class UpdateUserCommand extends Command<UserResponseDto> {
  constructor(
    public readonly userId: UpdateUserRequestParamsDto["id"],
    public readonly data: UpdateUserRequestBodyDto
  ) {
    super();
  }
}
