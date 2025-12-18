import { Problem } from "@api/app/modules/problem/dtos/common";
import { UpdateProblemRequestBodyDto } from "@api/app/modules/problem/dtos/update-problem.dtos";
import { Command } from "@nestjs/cqrs";

export class UpdateProblemCommand extends Command<Problem> {
  constructor(
    public readonly problemId: string,
    public readonly data: UpdateProblemRequestBodyDto
  ) {
    super();
  }
}
