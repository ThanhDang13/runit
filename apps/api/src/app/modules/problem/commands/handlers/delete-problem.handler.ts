import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteProblemCommand } from "@api/app/modules/problem/commands/delete-problem.command";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { Inject, NotFoundException } from "@nestjs/common";
import { problems, testcases } from "@api/app/infrastructure/database/schema";
import { eq } from "drizzle-orm";

@CommandHandler(DeleteProblemCommand)
export class DeleteProblemHandler implements ICommandHandler<DeleteProblemCommand, { id: string }> {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}

  async execute(command: DeleteProblemCommand): Promise<{ id: string }> {
    const { problemId } = command;

    await this.db.delete(testcases).where(eq(testcases.problemId, problemId));
    const [deleted] = await this.db.delete(problems).where(eq(problems.id, problemId)).returning();

    if (!deleted) {
      throw new NotFoundException(`Problem with id ${problemId} not found`);
    }

    return { id: problemId };
  }
}
