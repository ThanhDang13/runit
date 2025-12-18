import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SubmitCodeCommand } from "../submit-code.command";
import { SubmissionService } from "@api/app/modules/submission/submission.service";
import { CommandBus } from "@nestjs/cqrs";
import { ExecuteCommand } from "@api/app/modules/execution/commands/execute.command";
import { ExecutionSummary } from "@api/app/modules/execution/dtos/common";

@CommandHandler(SubmitCodeCommand)
export class SubmitCodeHandler implements ICommandHandler<SubmitCodeCommand> {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly commandBus: CommandBus
  ) {}

  async execute(command: SubmitCodeCommand): Promise<ExecutionSummary> {
    const { code, language, problemId, userId } = command;

    const submission = await this.submissionService.createSubmission({
      problemId,
      userId,
      language,
      code,
      status: "pending",
      summary: {}
    });

    const summary: ExecutionSummary = await this.commandBus.execute(
      new ExecuteCommand(code, language, problemId, true)
    );

    const status =
      (
        {
          ACCEPTED: "accepted",
          TIME_LIMIT_EXCEEDED: "time_limit_exceeded",
          RUNTIME_ERROR: "runtime_error",
          COMPILATION_ERROR: "compilation_error"
        } as const
      )[summary.verdict] ?? "wrong_answer";

    await this.submissionService.updateSubmission(submission.id, {
      status,
      summary: summary
    });

    return summary;
  }
}
