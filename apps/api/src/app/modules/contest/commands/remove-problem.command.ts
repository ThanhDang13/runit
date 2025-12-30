import { ContestProblem } from "@api/app/modules/contest/contest.service";
import { Command } from "@nestjs/cqrs";

export class RemoveProblemFromContestCommand extends Command<ContestProblem> {
  constructor(
    public readonly contestId: string,
    public readonly problemId: string,
    public readonly order?: number
  ) {
    super();
  }
}
