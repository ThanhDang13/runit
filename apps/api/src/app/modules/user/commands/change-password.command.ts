import { Command } from "@nestjs/cqrs";

export class ChangePasswordCommand extends Command<void> {
  constructor(
    public readonly userId: string,
    public readonly currentPassword: string,
    public readonly newPassword: string
  ) {
    super();
  }
}
