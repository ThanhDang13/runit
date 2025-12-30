import { MessageResponseDto } from "@api/app/common/types/common";
import { Command } from "@nestjs/cqrs";

export class ResendVerificationCommand extends Command<MessageResponseDto> {
  constructor(public readonly email: string) {
    super();
  }
}
