import { DeleteProblemRequestParamsDto } from "@api/app/modules/problem/dtos/delete-problem.dtos";
import { Command } from "@nestjs/cqrs";

export class DeleteUserCommand extends Command<{ id: string }> {
  constructor(public readonly userId: DeleteProblemRequestParamsDto["id"]) {
    super();
  }
}
