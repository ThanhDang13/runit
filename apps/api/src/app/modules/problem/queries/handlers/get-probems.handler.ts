import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { and, asc, desc, eq, ilike, isNull, sql } from "drizzle-orm";
import { OffsetPaginated, OffsetPagingDTO, Paginated } from "@api/app/common/types/pagination";
import { GetProblemsQuery } from "@api/app/modules/problem/queries/get-problems.query";
import { problems, submissions } from "@api/app/infrastructure/database/schema";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { Inject } from "@nestjs/common";
import { normalizeToIso } from "@api/app/common/helpers/common";
import { Problem } from "@api/app/modules/problem/dtos/common";

@QueryHandler(GetProblemsQuery)
export class GetProblemsHandler implements IQueryHandler<GetProblemsQuery, Paginated<Problem>> {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}
  async execute(query: GetProblemsQuery): Promise<OffsetPaginated<Problem>> {
    const { paging, keyword, difficulty, userId } = query;
    const { type, page, limit, sort, order } = paging;

    const allowedSort = ["title", "difficulty", "createdAt"];

    const sortColumnMap = {
      title: problems.title,
      difficulty: problems.difficulty,
      createdAt: problems.createdAt
    };

    const safeSort = allowedSort.includes(sort) ? sortColumnMap[sort] : sortColumnMap["createdAt"];

    const orderExpression = order === "asc" ? asc(safeSort) : desc(safeSort);

    const filters = [];
    if (keyword) {
      filters.push(ilike(problems.title, `%${keyword}%`));
    }
    if (difficulty) {
      filters.push(eq(problems.difficulty, difficulty));
    }

    const whereClause = filters.length ? and(...filters) : undefined;

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(problems)
      .where(whereClause);

    const offset = (page - 1) * limit;

    if (!userId) {
      const data = await this.db
        .select({
          id: problems.id,
          title: problems.title,
          description: problems.description,
          difficulty: problems.difficulty,
          createdAt: problems.createdAt,
          updatedAt: problems.updatedAt
        })
        .from(problems)
        .where(whereClause)
        .orderBy(orderExpression)
        .limit(limit)
        .offset(offset);

      return {
        type,
        paging,
        total: Number(count),
        data
      };
    }

    const data = await this.db
      .select({
        id: problems.id,
        title: problems.title,
        difficulty: problems.difficulty,
        description: problems.description,
        createdAt: problems.createdAt,
        updatedAt: problems.updatedAt,
        status: sql<"solved" | "attempted" | "unsolved">`
          CASE
            WHEN SUM(
              CASE
                WHEN submissions.status = 'accepted' THEN 1
                ELSE 0
              END
            ) > 0 THEN 'solved'
            WHEN COUNT(submissions.id) > 0 THEN 'attempted'
            ELSE 'unsolved'
          END
        `
      })
      .from(problems)
      .leftJoin(
        submissions,
        and(
          eq(submissions.problemId, problems.id),
          eq(submissions.userId, userId),
          isNull(submissions.contestId)
        )
      )
      .where(whereClause)
      .groupBy(problems.id)
      .orderBy(orderExpression)
      .limit(limit)
      .offset(offset);

    return {
      type,
      paging: paging,
      total: Number(count),
      data
    };
  }
}
