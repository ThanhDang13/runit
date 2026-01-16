import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { SubmissionService } from "./submission.service";
import { SubmitCodeHandler } from "./commands/handlers/submit-code.handler";
import { SubmissionController } from "./submission.controller";
import { ExecutionModule } from "@api/app/modules/execution/execution.module";
import { JwtStrategy } from "@api/app/modules/auth/strategy/jwt.strategy";

import { DeleteSubmissionHandler } from "./commands/handlers/delete-submission.handler";
import { GetSubmissionsHandler } from "@api/app/modules/submission/queries/handlers/get-submissions.handler";

@Module({
  imports: [CqrsModule, ExecutionModule],
  providers: [SubmissionService, SubmitCodeHandler, GetSubmissionsHandler, DeleteSubmissionHandler],
  controllers: [SubmissionController],
  exports: [SubmissionService]
})
export class SubmissionModule {}
