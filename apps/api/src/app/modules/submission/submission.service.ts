import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { contests, submissions } from "@api/app/infrastructure/database/schema";
import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";

export type Submission = InferSelectModel<typeof submissions>;
export type InsertSubmission = InferInsertModel<typeof submissions>;

@Injectable()
export class SubmissionService {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}

  async createSubmission(data: InsertSubmission): Promise<Submission> {
    const { contestId } = data;

    if (contestId) {
      const [contest] = await this.db
        .select({
          id: contests.id,
          startTime: contests.startTime,
          endTime: contests.endTime
        })
        .from(contests)
        .where(eq(contests.id, contestId))
        .limit(1);

      if (!contest) {
        throw new NotFoundException("Contest not found");
      }

      const startTime = new Date(contest.startTime);
      const endTime = new Date(contest.endTime);
      const now = new Date();

      if (now < startTime) {
        throw new BadRequestException("Contest has not started yet");
      }

      if (now > endTime) {
        throw new BadRequestException("Contest has already ended");
      }
    }

    const [submission] = await this.db.insert(submissions).values(data).returning();

    return submission;
  }

  async updateSubmission(id: string, data: Partial<Submission>): Promise<Submission> {
    const [submission] = await this.db
      .update(submissions)
      .set(data)
      .where(eq(submissions.id, id))
      .returning();
    return submission;
  }

  async deleteSubmission(submissionId: string): Promise<void> {
    await this.db.delete(submissions).where(eq(submissions.id, submissionId));
  }
}
