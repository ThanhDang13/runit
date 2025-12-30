import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { contestProblems } from "@api/app/infrastructure/database/schema";
import { and, eq } from "drizzle-orm";
import { RemoveProblemFromContestCommand } from "@api/app/modules/contest/commands/remove-problem.command";

@CommandHandler(RemoveProblemFromContestCommand)
export class RemoveProblemFromContestHandler implements ICommandHandler<RemoveProblemFromContestCommand> {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}

  async execute(command: RemoveProblemFromContestCommand) {
    const { contestId, problemId } = command;

    const [deleted] = await this.db
      .delete(contestProblems)
      .where(
        and(eq(contestProblems.contestId, contestId), eq(contestProblems.problemId, problemId))
      )
      .returning();

    return deleted;
  }
}
