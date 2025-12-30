import { ContestService } from "@api/app/modules/contest/contest.service";
import { ContestDetails } from "@api/app/modules/contest/dtos/common";
import { GetContestQuery } from "@api/app/modules/contest/queries/get-contest.query";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

@QueryHandler(GetContestQuery)
export class GetContestHandler implements IQueryHandler<GetContestQuery> {
  constructor(private readonly contestService: ContestService) {}

  async execute(query: GetContestQuery): Promise<ContestDetails> {
    return this.contestService.getContest(query.contestId, query.userId);
  }
}
