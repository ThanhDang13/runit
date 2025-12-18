import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import * as schema from "@api/app/infrastructure/database/schema";
import { Inject, Injectable } from "@nestjs/common";
import { InferInsertModel, InferSelectModel, eq } from "drizzle-orm";

export type Submission = InferSelectModel<typeof schema.submissions>;
export type InsertSubmission = InferInsertModel<typeof schema.submissions>;

@Injectable()
export class SubmissionService {
  constructor(@Inject("PG") private readonly db: PGDatabase) {}

  async createSubmission(data: InsertSubmission): Promise<Submission> {
    const [submission] = await this.db.insert(schema.submissions).values(data).returning();
    return submission;
  }

  async updateSubmission(id: string, data: Partial<Submission>): Promise<Submission> {
    const [submission] = await this.db
      .update(schema.submissions)
      .set(data)
      .where(eq(schema.submissions.id, id))
      .returning();
    return submission;
  }
}
