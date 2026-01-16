
import { Command } from "@nestjs/cqrs";

export class DeleteContestCommand extends Command<void> {
  constructor(public readonly contestId: string) {
    super();
  }
}
