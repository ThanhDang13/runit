import { ProblemController } from "@api/app/modules/problem/problem.controller";
import { GetProblemsHandler } from "@api/app/modules/problem/queries/handlers/get-probems.handler";
import { GetProblemByIdHandler } from "@api/app/modules/problem/queries/handlers/get-problem-by-id.handler";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

import { CreateProblemHandler } from "@api/app/modules/problem/commands/handlers/create-problem.handler";
import { UpdateProblemHandler } from "@api/app/modules/problem/commands/handlers/update-problem.handler";
import { DeleteProblemHandler } from "@api/app/modules/problem/commands/handlers/delete-problem.handler";

@Module({
  imports: [CqrsModule],
  controllers: [ProblemController],
  providers: [GetProblemsHandler, GetProblemByIdHandler, CreateProblemHandler, UpdateProblemHandler, DeleteProblemHandler]
})
export class ProblemModule {}
