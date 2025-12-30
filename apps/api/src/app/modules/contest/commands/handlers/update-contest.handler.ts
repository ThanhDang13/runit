import { UpdateContestCommand } from "@api/app/modules/contest/commands/update-contest.command";
import { ContestService } from "@api/app/modules/contest/contest.service";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

@CommandHandler(UpdateContestCommand)
export class UpdateContestHandler implements ICommandHandler<UpdateContestCommand> {
  constructor(private readonly contestService: ContestService) {}

  async execute(command: UpdateContestCommand) {
    const { contestId, data } = command;
    const contest = await this.contestService.updateContest(contestId, data);
    return contest;
  }
}
