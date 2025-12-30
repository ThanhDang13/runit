import { ProblemWithTestcases } from "@api/app/modules/problem/dtos/common";
import { Query } from "@nestjs/cqrs";

export class GetProblemByIdQuery extends Query<ProblemWithTestcases> {
  constructor(
    public readonly problemId: string,
    public readonly withHiddenCases?: boolean
  ) {
    super();
  }
}
