import { OffsetPaginated, OffsetPagingDTO } from "@api/app/common/types/pagination";
import { Contest } from "@api/app/modules/contest/contest.service";
import { Query } from "@nestjs/cqrs";

export class GetContestsQuery extends Query<OffsetPaginated<Contest>> {
  constructor(
    public readonly paging: OffsetPagingDTO,
    public readonly keyword?: string
  ) {
    super();
  }
}
