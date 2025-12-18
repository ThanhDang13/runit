import z from "zod";
import { PassResultSchema, PassSummarySchema } from "@api/app/modules/execution/dtos/execute.dtos";

export const SubmissionSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  problem: z.object({
    id: z.uuid(),
    title: z.string()
  }),
  language: z.string(),
  code: z.string(),
  status: z.literal([
    "pending",
    "accepted",
    "wrong_answer",
    "time_limit_exceeded",
    "runtime_error",
    "compilation_error"
  ]),
  summary: PassSummarySchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});

export type Submission = z.infer<typeof SubmissionSchema>;
