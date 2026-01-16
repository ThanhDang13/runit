
import { Command } from "@nestjs/cqrs";

export class DeleteSubmissionCommand extends Command<void> {
  constructor(public readonly submissionId: string) {
    super();
  }
}
