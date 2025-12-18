import { GetUserByIdRequestParamsDto, UserResponseDto } from "@api/app/modules/user/dtos/user.dtos";
import { Query } from "@nestjs/cqrs";

export class GetUserByIdQuery extends Query<UserResponseDto> {
  constructor(public readonly userId: GetUserByIdRequestParamsDto["id"]) {
    super();
  }
}
