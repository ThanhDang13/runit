import { SignupRequestBodyDto, AuthResponseDto } from "@api/app/modules/auth/dtos/auth.dtos";
import { Command } from "@nestjs/cqrs";

export class SignupCommand extends Command<AuthResponseDto> {
  constructor(public readonly data: SignupRequestBodyDto) {
    super();
  }
}
