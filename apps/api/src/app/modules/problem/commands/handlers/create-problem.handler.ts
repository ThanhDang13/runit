import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateProblemCommand } from "@api/app/modules/problem/commands/create-problem.command";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { Inject } from "@nestjs/common";
import { problems, testcases } from "@api/app/infrastructure/database/schema";
import { normalizeToIso } from "@api/app/common/helpers/common";
import { Problem } from "@api/app/modules/problem/dtos/common";

@CommandHandler(CreateProblemCommand)
export class CreateProblemHandler implements ICommandHandler<CreateProblemCommand, Problem> {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}

  async execute(command: CreateProblemCommand): Promise<Problem> {
    const { data } = command;

    const [newProblem] = await this.db
      .insert(problems)
      .values({
        title: data.title,
        description: data.description,
        difficulty: data.difficulty
      })
      .returning();

    if (data.testcases && data.testcases.length > 0) {
      const newTestcases = data.testcases.map((testcase) => ({
        problemId: newProblem.id,
        input: testcase.input,
        expectedOutput: testcase.expectedOutput,
        isSample: testcase.isSample
      }));
      await this.db.insert(testcases).values(newTestcases);
    }

    return newProblem;
  }
}
