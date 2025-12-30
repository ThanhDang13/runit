import { MessageResponseDto } from "@api/app/common/types/common";
import { Command } from "@nestjs/cqrs";

export class VerifyEmailCommand extends Command<MessageResponseDto> {
  constructor(public readonly token: string) {
    super();
  }
}
