import { Contest } from "@api/app/modules/contest/contest.service";
import { Command } from "@nestjs/cqrs";

export class CreateContestCommand extends Command<Contest> {
  constructor(
    public readonly title: string,
    public readonly description: string | null,
    public readonly startTime: string,
    public readonly endTime: string
  ) {
    super();
  }
}
