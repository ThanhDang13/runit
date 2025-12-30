import { MessageResponseDto } from "@api/app/common/types/common";
import { SignupRequestBodyDto } from "@api/app/modules/auth/dtos/auth.dtos";
import { Command } from "@nestjs/cqrs";

export class SignupCommand extends Command<MessageResponseDto> {
  constructor(public readonly data: SignupRequestBodyDto) {
    super();
  }
}
