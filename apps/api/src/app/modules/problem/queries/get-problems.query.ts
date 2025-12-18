import {
  OffsetPaginated,
  OffsetPagingDTO,
  Paginated,
  PagingDTO
} from "@api/app/common/types/pagination";
import { Problem } from "@api/app/modules/problem/dtos/common";
import { Query } from "@nestjs/cqrs";

export class GetProblemsQuery extends Query<OffsetPaginated<Problem>> {
  constructor(
    public readonly paging: OffsetPagingDTO,
    public readonly keyword?: string,
    public readonly difficulty?: string
  ) {
    super();
  }
}
