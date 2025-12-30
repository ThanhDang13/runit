import { Injectable, Inject } from "@nestjs/common";
import { eq, InferInsertModel, InferSelectModel, and, desc, sql, asc } from "drizzle-orm";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import {
  contests,
  contestProblems,
  contestParticipants,
  submissions,
  problems,
  users
} from "@api/app/infrastructure/database/schema";
import { OffsetPaginated, OffsetPagingDTO } from "@api/app/common/types/pagination";
import { Submission, SubmissionSchema } from "@api/app/modules/submission/dtos/common.dtos";

export type Contest = InferSelectModel<typeof contests>;
export type InsertContest = InferInsertModel<typeof contests>;
export type ContestProblem = InferSelectModel<typeof contestProblems>;
export type InsertContestProblem = InferInsertModel<typeof contestProblems>;
export type ContestParticipant = InferSelectModel<typeof contestParticipants>;
export type InsertContestParticipant = InferInsertModel<typeof contestParticipants>;

@Injectable()
export class ContestService {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}

  async createContest(data: InsertContest): Promise<Contest> {
    const [contest] = await this.db.insert(contests).values(data).returning();
    return contest;
  }

  async updateContest(id: string, data: Partial<Contest>): Promise<Contest> {
    const [contest] = await this.db
      .update(contests)
      .set(data)
      .where(eq(contests.id, id))
      .returning();
    return contest;
  }

  async joinContest(contestId: string, userId: string): Promise<ContestParticipant> {
    const [participant] = await this.db
      .insert(contestParticipants)
      .values({ contestId, userId })
      .returning();
    return participant;
  }

  async getContests(
    page: number,
    limit: number,
    sort: string,
    order: "asc" | "desc"
  ): Promise<OffsetPaginated<Contest>> {
    const allowedSort = ["createdAt", "startTime", "endTime", "title"];

    const sortColumnMap = {
      createdAt: contests.createdAt,
      startTime: contests.startTime,
      endTime: contests.endTime,
      title: contests.title
    };

    const safeSort = allowedSort.includes(sort) ? sortColumnMap[sort] : sortColumnMap["createdAt"];

    const orderExpression = order === "asc" ? asc(safeSort) : desc(safeSort);

    const [{ count }] = await this.db.select({ count: sql<number>`count(*)` }).from(contests);

    const offset = (page - 1) * limit;

    const rows = await this.db
      .select()
      .from(contests)
      .orderBy(orderExpression)
      .limit(limit)
      .offset(offset);

    return {
      type: "offset",
      paging: {
        type: "offset",
        page,
        limit,
        sort,
        order
      },
      total: Number(count),
      data: rows
    };
  }

  async getContestSubmissions(
    contestId: string,
    page: number,
    limit: number
  ): Promise<OffsetPaginated<Submission>> {
    const filters = [eq(submissions.contestId, contestId)];

    const whereClause = filters.length ? and(...filters) : undefined;

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(submissions)
      .where(whereClause);

    const offset = (page - 1) * limit;

    const rows = await this.db
      .select({
        id: submissions.id,
        userId: submissions.userId,
        language: submissions.language,
        code: submissions.code,
        status: submissions.status,
        summary: submissions.summary,
        createdAt: submissions.createdAt,
        updatedAt: submissions.updatedAt,
        problem: {
          id: problems.id,
          title: problems.title
        }
      })
      .from(submissions)
      .leftJoin(problems, eq(problems.id, submissions.problemId))
      .where(whereClause)
      .orderBy(desc(submissions.createdAt))
      .limit(limit)
      .offset(offset);

    const results: Submission[] = rows.map((row) => SubmissionSchema.parse(row));

    return {
      type: "offset",
      paging: { type: "offset", page, limit, sort: "createdAt", order: "desc" },
      total: Number(count),
      data: results
    };
  }

  async getContest(contestId: string, userId?: string) {
    const [contest] = await this.db.select().from(contests).where(eq(contests.id, contestId));

    const problemsOfThis = await this.getContestProblemsWithStatus(contestId, userId);

    const participants = await this.db
      .select({
        id: contestParticipants.id,
        contestId: contestParticipants.contestId,
        userId: contestParticipants.userId,
        joinedAt: contestParticipants.joinedAt,
        name: users.name,
        solved: sql<number>`
          count(
            DISTINCT CASE
              WHEN ${submissions.status} = 'accepted'
              AND ${submissions.contestId} = ${contestParticipants.contestId} THEN ${submissions.problemId}
            END
          )
        `,
        penalty: sql<number>`
          (
            SELECT
              count(*)
            FROM
              ${submissions}
            WHERE
              user_id = ${contestParticipants.userId}
              AND contest_id = ${contestParticipants.contestId}
              AND status != 'accepted'
          )
        `
      })
      .from(contestParticipants)
      .leftJoin(users, eq(users.id, contestParticipants.userId))
      .leftJoin(submissions, eq(submissions.userId, contestParticipants.userId))
      .where(eq(contestParticipants.contestId, contestId))
      .groupBy(contestParticipants.id, users.name);

    const rankings = participants.sort((a, b) => {
      if (b.solved !== a.solved) return b.solved - a.solved;
      return a.penalty - b.penalty;
    });

    return { ...contest, problems: problemsOfThis, participants: rankings };
  }

  async getContestProblemsWithStatus(contestId: string, userId?: string) {
    if (!userId) {
      return this.db
        .select({
          id: contestProblems.id,
          contestId: contestProblems.contestId,
          problemId: contestProblems.problemId,
          order: contestProblems.order,
          title: problems.title,
          status: sql<"unsolved">`'unsolved'`
        })
        .from(contestProblems)
        .leftJoin(problems, eq(problems.id, contestProblems.problemId))
        .where(eq(contestProblems.contestId, contestId))
        .orderBy(contestProblems.order);
    }

    return this.db
      .select({
        id: contestProblems.id,
        contestId: contestProblems.contestId,
        problemId: contestProblems.problemId,
        order: contestProblems.order,
        title: problems.title,
        status: sql<"solved" | "attempted" | "unsolved">`
          CASE
            WHEN SUM(
              CASE
                WHEN ${submissions.status} = 'accepted' THEN 1
                ELSE 0
              END
            ) > 0 THEN 'solved'
            WHEN COUNT(${submissions.id}) > 0 THEN 'attempted'
            ELSE 'unsolved'
          END
        `
      })
      .from(contestProblems)
      .leftJoin(problems, eq(problems.id, contestProblems.problemId))
      .leftJoin(
        submissions,
        and(
          eq(submissions.problemId, contestProblems.problemId),
          eq(submissions.userId, userId),
          eq(submissions.contestId, contestId)
        )
      )
      .where(eq(contestProblems.contestId, contestId))
      .groupBy(contestProblems.id, problems.title)
      .orderBy(contestProblems.order);
  }
}
