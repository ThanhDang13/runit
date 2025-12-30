import z from "zod";

export const ProblemSchema = z.object({
  difficulty: z.string(),
  id: z.uuid(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(6, "Description must be at least 3 characters"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  status: z.literal(["solved", "attempted", "unsolved"]).optional()
});

export type Problem = z.infer<typeof ProblemSchema>;

export const TestcaseSchema = z.object({
  id: z.uuid(),
  problemId: z.string(),
  input: z.string(),
  expectedOutput: z.string(),
  isSample: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
});

export type Testcase = z.infer<typeof TestcaseSchema>;

export const ProblemWithTestCaseSchema = ProblemSchema.extend({
  testcases: z.array(TestcaseSchema)
});

export type ProblemWithTestcases = z.infer<typeof ProblemWithTestCaseSchema>;
