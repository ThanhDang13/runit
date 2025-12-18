import { GetUsersRequestQueryDto, GetUsersResponseDto } from "@api/app/modules/user/dtos/user.dtos";
import { OffsetPagingDTO } from "@api/app/common/types/pagination";
import { Query } from "@nestjs/cqrs";

export class GetUsersQuery extends Query<GetUsersResponseDto> {
  constructor(
    public readonly paging: OffsetPagingDTO,
    public readonly keyword?: string
  ) {
    super();
  }
}
