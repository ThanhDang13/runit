import { relations } from "drizzle-orm/relations";
import { problems, testcases, users, submissions } from "./schema";

export const problemsRelations = relations(problems, ({ many }) => ({
  testcases: many(testcases),
  submissions: many(submissions)
}));

export const testcasesRelations = relations(testcases, ({ one }) => ({
  problem: one(problems, {
    fields: [testcases.problemId],
    references: [problems.id]
  })
}));

export const usersRelations = relations(users, ({ many }) => ({
  submissions: many(submissions)
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  problem: one(problems, {
    fields: [submissions.problemId],
    references: [problems.id]
  }),
  user: one(users, {
    fields: [submissions.userId],
    references: [users.id]
  })
}));
