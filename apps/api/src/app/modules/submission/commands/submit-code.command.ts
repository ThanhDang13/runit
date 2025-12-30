import { Command } from "@nestjs/cqrs";
import { ExecutionSummary } from "@api/app/modules/execution/dtos/common";

import { SubmitCodeResponseDto } from "@api/app/modules/submission/dtos/submit-code.dtos";

export class SubmitCodeCommand extends Command<SubmitCodeResponseDto> {
  constructor(
    public readonly code: string,
    public readonly language: string,
    public readonly problemId: string,
    public readonly userId: string,
    public readonly contestId?: string
  ) {
    super();
  }
}
