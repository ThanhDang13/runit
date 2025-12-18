import { OffsetPaginated, OffsetPagingDTO } from "@api/app/common/types/pagination";
import { Submission } from "@api/app/modules/submission/dtos/common.dtos";
import { Query } from "@nestjs/cqrs";

export class GetSubmissionsQuery extends Query<OffsetPaginated<Submission>> {
  constructor(
    public readonly paging: OffsetPagingDTO,
    public readonly userId?: string,
    public readonly problemId?: string,
    public readonly language?: string,
    public readonly status?: string
  ) {
    super();
  }
}
