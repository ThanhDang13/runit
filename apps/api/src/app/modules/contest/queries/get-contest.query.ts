import { ContestDetails } from "@api/app/modules/contest/dtos/common";
import { Query } from "@nestjs/cqrs";

export class GetContestQuery extends Query<ContestDetails> {
  constructor(
    public readonly contestId: string,
    public readonly userId?: string
  ) {
    super();
  }
}
