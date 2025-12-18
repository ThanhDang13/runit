import { ExecutionSummary } from "@api/app/modules/execution/dtos/common";
import { Command } from "@nestjs/cqrs";

export class ExecuteCommand extends Command<ExecutionSummary> {
  constructor(
    public readonly code: string,
    public readonly language: string,
    public readonly problemId: string,
    public readonly isSubmitted?: boolean
  ) {
    super();
  }
}
