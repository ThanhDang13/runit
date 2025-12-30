import { Contest } from "@api/app/modules/contest/contest.service";
import { Command } from "@nestjs/cqrs";

export class UpdateContestCommand extends Command<Contest> {
  constructor(
    public readonly contestId: string,
    public readonly data: {
      title?: string;
      description?: string | null;
      startTime?: string;
      endTime?: string;
    }
  ) {
    super();
  }
}
