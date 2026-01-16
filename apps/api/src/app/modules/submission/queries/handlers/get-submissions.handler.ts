import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { and, asc, desc, eq, ilike, isNull, sql } from "drizzle-orm";
import { OffsetPaginated } from "@api/app/common/types/pagination";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { Inject } from "@nestjs/common";
import { GetSubmissionsQuery } from "../get-submissions.query";
import { Submission, SubmissionSchema } from "@api/app/modules/submission/dtos/common.dtos";
import { contests, problems, submissions, users } from "@api/app/infrastructure/database/schema";

@QueryHandler(GetSubmissionsQuery)
export class GetSubmissionsHandler implements IQueryHandler<
  GetSubmissionsQuery,
  OffsetPaginated<Submission>
> {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}

  async execute(query: GetSubmissionsQuery): Promise<OffsetPaginated<Submission>> {
    const { paging, userId, problemId, language, status, contestId, currentUserId } = query;
    const { type, page, limit, sort, order } = paging;

    const allowedSort = ["createdAt", "language", "status"];

    const sortColumnMap = {
      createdAt: submissions.createdAt,
      language: submissions.language,
      status: submissions.status
    };

    const safeSort = allowedSort.includes(sort) ? sortColumnMap[sort] : sortColumnMap["createdAt"];

    const orderExpression = order === "asc" ? asc(safeSort) : desc(safeSort);

    const filters = [];
    if (userId) {
      filters.push(eq(submissions.userId, userId));
    }
    if (problemId) {
      filters.push(eq(submissions.problemId, problemId));
    }
    if (language) {
      filters.push(eq(submissions.language, language));
    }
    if (status) {
      filters.push(eq(submissions.status, status));
    }
    // if (currentUserId) {
    //   filters.push(eq(submissions.userId, currentUserId));
    // }
    if (typeof query.contestId === "string" && query.contestId.length > 0) {
      filters.push(eq(submissions.contestId, query.contestId));
    } else {
      filters.push(isNull(submissions.contestId));
    }

    const whereClause = filters.length ? and(...filters) : null;

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(submissions)
      .where(whereClause);

    const offset = (page - 1) * limit;

    const now = new Date();

    let contestRunning;
    if (contestId) {
      const contestRow = await this.db
        .select({ startTime: sql<Date>`start_time`, endTime: sql<Date>`end_time` })
        .from(contests)
        .where(eq(sql<string>`id`, contestId))
        .limit(1)
        .then((rows) => rows[0]);

      if (contestRow) {
        const startTime = new Date(contestRow.startTime);
        const endTime = new Date(contestRow.endTime);

        if (now >= startTime && now <= endTime) {
          contestRunning = true;
        }
      }
    }

    const rows = await this.db
      .select({
        id: submissions.id,
        language: submissions.language,
        code: submissions.code,
        status: submissions.status,
        summary: submissions.summary,
        createdAt: submissions.createdAt,
        updatedAt: submissions.updatedAt,
        problem: {
          id: problems.id,
          title: problems.title
        },
        user: {
          id: users.id,
          name: users.name
        }
      })
      .from(submissions)
      .leftJoin(problems, eq(problems.id, submissions.problemId))
      .leftJoin(users, eq(users.id, submissions.userId))
      .where(whereClause)
      .orderBy(orderExpression)
      .limit(limit)
      .offset(offset);

    const results: Submission[] = rows.map((row) => {
      if (contestRunning && row.user?.id !== query.currentUserId) {
        return SubmissionSchema.parse({ ...row, code: null });
      }
      return SubmissionSchema.parse(row);
    });

    return {
      type,
      paging,
      total: Number(count),
      data: results
    };
  }
}
