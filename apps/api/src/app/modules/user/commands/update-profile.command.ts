import { Command } from "@nestjs/cqrs";
import { UserResponseDto } from "@api/app/modules/user/dtos/user.dtos";
import { UpdateProfileRequestBodyDto } from "@api/app/modules/user/dtos/profile.dtos";

export class UpdateProfileCommand extends Command<UserResponseDto> {
  constructor(
    public readonly userId: string,
    public readonly data: UpdateProfileRequestBodyDto
  ) {
    super();
  }
}
