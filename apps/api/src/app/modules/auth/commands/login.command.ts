import { LoginRequestBodyDto, AuthResponseDto } from "@api/app/modules/auth/dtos/auth.dtos";
import { Command } from "@nestjs/cqrs";

export class LoginCommand extends Command<AuthResponseDto> {
  constructor(public readonly data: LoginRequestBodyDto) {
    super();
  }
}
