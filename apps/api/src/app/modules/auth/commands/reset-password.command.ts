import { Command } from "@nestjs/cqrs";

export class ResetPasswordCommand extends Command<void> {
  constructor(
    public readonly email: string,
    public readonly pin: string,
    public readonly newPassword: string
  ) {
    super();
  }
}
