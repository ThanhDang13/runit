import z from "zod";

export const ContestProblemSchema = z.object({
  id: z.string(),
  contestId: z.string(),
  problemId: z.string(),
  title: z.string(),
  order: z.number(),
  status: z.literal(["solved", "attempted", "unsolved"]).optional()
});

export const ContestParticipantSchema = z.object({
  id: z.string(),
  contestId: z.string(),
  userId: z.string().nullish(),
  name: z.string().nullish(),
  joinedAt: z.string(),
  solved: z.coerce.number().default(0),
  penalty: z.coerce.number().default(0)
});

export const ContestSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
  problems: z.array(ContestProblemSchema),
  participants: z.array(ContestParticipantSchema)
});

export type ContestDetails = z.infer<typeof ContestSchema>;
