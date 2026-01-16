
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ContestService } from "@api/app/modules/contest/contest.service";
import { DeleteContestCommand } from "../delete-contest.command";

@CommandHandler(DeleteContestCommand)
export class DeleteContestHandler implements ICommandHandler<DeleteContestCommand> {
  constructor(private readonly contestService: ContestService) {}

  async execute(command: DeleteContestCommand): Promise<void> {
    const { contestId } = command;
    await this.contestService.deleteContest(contestId);
  }
}
