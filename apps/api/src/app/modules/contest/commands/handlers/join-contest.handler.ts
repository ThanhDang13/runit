import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JoinContestCommand } from '../join-contest.command';
import { ContestService } from '../../contest.service';

@CommandHandler(JoinContestCommand)
export class JoinContestHandler implements ICommandHandler<JoinContestCommand> {
  constructor(private readonly contestService: ContestService) {}

  async execute(command: JoinContestCommand) {
    const { contestId, userId } = command;
    const participant = await this.contestService.joinContest(contestId, userId);
    return participant;
  }
}