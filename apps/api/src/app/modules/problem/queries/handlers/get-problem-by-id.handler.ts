import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { problems, testcases } from "@api/app/infrastructure/database/schema";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { Inject, NotFoundException } from "@nestjs/common";
import { normalizeToIso } from "@api/app/common/helpers/common";
import { GetProblemByIdQuery } from "@api/app/modules/problem/queries/get-problem-by-id.query";
import { ProblemWithTestcases } from "@api/app/modules/problem/dtos/common";
import { eq } from "drizzle-orm";

@QueryHandler(GetProblemByIdQuery)
export class GetProblemByIdHandler implements IQueryHandler<
  GetProblemByIdQuery,
  ProblemWithTestcases
> {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}
  async execute(query: GetProblemByIdQuery): Promise<ProblemWithTestcases> {
    const { problemId, withHiddenCases } = query;

    const result = await this.db.query.problems.findFirst({
      where: eq(problems.id, problemId),
      with: {
        testcases: {
          where: withHiddenCases ? undefined : eq(testcases.isSample, true)
        }
      }
    });

    if (!result) {
      throw new NotFoundException(`Problem with id ${problemId} not found`);
    }

    return result;
  }
}
