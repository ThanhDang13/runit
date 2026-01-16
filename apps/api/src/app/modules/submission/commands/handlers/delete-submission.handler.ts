
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SubmissionService } from "@api/app/modules/submission/submission.service";
import { DeleteSubmissionCommand } from "../delete-submission.command";

@CommandHandler(DeleteSubmissionCommand)
export class DeleteSubmissionHandler implements ICommandHandler<DeleteSubmissionCommand> {
  constructor(private readonly submissionService: SubmissionService) {}

  async execute(command: DeleteSubmissionCommand): Promise<void> {
    const { submissionId } = command;
    await this.submissionService.deleteSubmission(submissionId);
  }
}
