import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { OffsetPaginated } from "@api/app/common/types/pagination";
import { GetContestsQuery } from "@api/app/modules/contest/queries/get-contests.query";
import { Contest, ContestService } from "@api/app/modules/contest/contest.service";

@QueryHandler(GetContestsQuery)
export class GetContestsHandler implements IQueryHandler<GetContestsQuery> {
  constructor(private readonly contestService: ContestService) {}

  async execute(query: GetContestsQuery): Promise<OffsetPaginated<Contest>> {
    const { page, limit, sort, order } = query.paging;
    return this.contestService.getContests(page, limit, sort, order, query.keyword);
  }
}
