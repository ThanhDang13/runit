import z from "zod";
import { PassResultSchema, PassSummarySchema } from "@api/app/modules/execution/dtos/execute.dtos";

export const SUBMISSION_STATUSES = [
  "pending",
  "accepted",
  "wrong_answer",
  "time_limit_exceeded",
  "runtime_error",
  "compilation_error"
] as const;

export const SubmissionSchema = z.object({
  id: z.uuid(),
  problem: z.object({
    id: z.uuid(),
    title: z.string()
  }),
  user: z.object({
    id: z.uuid(),
    name: z.string()
  }),
  language: z.string(),
  code: z.string().nullish(),
  status: z.literal(SUBMISSION_STATUSES),
  summary: PassSummarySchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});

export type Submission = z.infer<typeof SubmissionSchema>;
