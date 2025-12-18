import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateProblemCommand } from "@api/app/modules/problem/commands/update-problem.command";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { Inject, NotFoundException } from "@nestjs/common";
import { problems, testcases } from "@api/app/infrastructure/database/schema";
import { normalizeToIso } from "@api/app/common/helpers/common";
import { and, eq, notInArray, sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { Problem } from "@api/app/modules/problem/dtos/common";

@CommandHandler(UpdateProblemCommand)
export class UpdateProblemHandler implements ICommandHandler<UpdateProblemCommand, Problem> {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}

  async execute(command: UpdateProblemCommand): Promise<Problem> {
    const { problemId, data } = command;
    const now = new Date().toISOString();

    const [updatedProblem] = await this.db
      .update(problems)
      .set({
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        updatedAt: now
      })
      .where(eq(problems.id, problemId))
      .returning();

    if (!updatedProblem) {
      throw new NotFoundException(`Problem with id ${problemId} not found`);
    }

    const existingIds = data.testcases?.map((tc) => tc.id).filter(Boolean) ?? [];
    if (existingIds.length > 0) {
      await this.db
        .delete(testcases)
        .where(and(eq(testcases.problemId, problemId), notInArray(testcases.id, existingIds)));
    } else {
      await this.db.delete(testcases).where(eq(testcases.problemId, problemId));
    }

    if (data.testcases && data.testcases.length > 0) {
      const upsertTestcases = data.testcases.map((tc) => ({
        id: tc.id,
        problemId,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isSample: tc.isSample,
        updatedAt: now
      }));

      await this.db
        .insert(testcases)
        .values(upsertTestcases)
        .onConflictDoUpdate({
          target: testcases.id,
          set: {
            input: sql`excluded.input`,
            expectedOutput: sql`excluded.expected_output`,
            isSample: sql`excluded.is_sample`,
            updatedAt: sql`excluded.updated_at`
          }
        });
    }

    return updatedProblem;
  }
}
