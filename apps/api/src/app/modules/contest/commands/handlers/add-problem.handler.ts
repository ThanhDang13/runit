import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { contestProblems } from "@api/app/infrastructure/database/schema";
import { AddProblemToContestCommand } from "@api/app/modules/contest/commands/add-problem.command";

@CommandHandler(AddProblemToContestCommand)
export class AddProblemToContestHandler implements ICommandHandler<AddProblemToContestCommand> {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}

  async execute(command: AddProblemToContestCommand) {
    const { contestId, problemId, order = 0 } = command;
    const [entry] = await this.db
      .insert(contestProblems)
      .values({ contestId, problemId, order })
      .returning();

    return entry;
  }
}
