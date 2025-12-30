import { ContestParticipant } from "@api/app/modules/contest/contest.service";
import { Command } from "@nestjs/cqrs";

export class JoinContestCommand extends Command<ContestParticipant> {
  constructor(
    public readonly contestId: string,
    public readonly userId: string
  ) {
    super();
  }
}
