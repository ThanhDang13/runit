import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { UserController } from "@api/app/modules/user/user.controller";
import { CreateUserHandler } from "@api/app/modules/user/commands/handlers/create-user.handler";
import { UpdateUserHandler } from "@api/app/modules/user/commands/handlers/update-user.handler";
import { DeleteUserHandler } from "@api/app/modules/user/commands/handlers/delete-user.handler";
import { GetUserByIdHandler } from "@api/app/modules/user/queries/handlers/get-user-by-id.handler";
import { GetUsersHandler } from "@api/app/modules/user/queries/handlers/get-users.handler";
import { UpdateProfileHandler } from "@api/app/modules/user/commands/handlers/update-profile.handler";
import { ProfileController } from "@api/app/modules/user/profile.controller";

@Module({
  imports: [CqrsModule],
  controllers: [UserController, ProfileController],
  providers: [
    CreateUserHandler,
    UpdateUserHandler,
    DeleteUserHandler,
    GetUserByIdHandler,
    GetUsersHandler,
    UpdateProfileHandler
  ]
})
export class UserModule {}
