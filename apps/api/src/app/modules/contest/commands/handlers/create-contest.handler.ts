import { CreateContestCommand } from "@api/app/modules/contest/commands/create-contest.command";
import { ContestService } from "@api/app/modules/contest/contest.service";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

@CommandHandler(CreateContestCommand)
export class CreateContestHandler implements ICommandHandler<CreateContestCommand> {
  constructor(private readonly contestService: ContestService) {}

  async execute(command: CreateContestCommand) {
    const { title, description, startTime, endTime } = command;
    return await this.contestService.createContest({ title, description, startTime, endTime });
  }
}
