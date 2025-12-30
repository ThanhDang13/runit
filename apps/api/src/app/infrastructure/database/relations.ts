import { relations } from "drizzle-orm/relations";
import {
  problems,
  testcases,
  users,
  submissions,
  contests,
  contestProblems,
  contestParticipants
} from "./schema";

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
  }),
  contest: one(contests, {
    fields: [submissions.contestId],
    references: [contests.id]
  })
}));

export const contestsRelations = relations(contests, ({ many }) => ({
  problems: many(contestProblems),
  participants: many(contestParticipants),
  submissions: many(submissions)
}));

export const contestProblemsRelations = relations(contestProblems, ({ one }) => ({
  contest: one(contests, {
    fields: [contestProblems.contestId],
    references: [contests.id]
  }),
  problem: one(problems, {
    fields: [contestProblems.problemId],
    references: [problems.id]
  })
}));

export const contestParticipantsRelations = relations(contestParticipants, ({ one }) => ({
  contest: one(contests, {
    fields: [contestParticipants.contestId],
    references: [contests.id]
  }),
  user: one(users, {
    fields: [contestParticipants.userId],
    references: [users.id]
  })
}));
