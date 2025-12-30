import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { SubmissionModule } from "@api/app/modules/submission/submission.module";
import { ContestController } from "@api/app/modules/contest/contest.controller";
import { ContestService } from "@api/app/modules/contest/contest.service";
import { GetContestsHandler } from "@api/app/modules/contest/queries/handlers/get-contests.handler";
import { GetContestHandler } from "@api/app/modules/contest/queries/handlers/get-contest.handler";
import { CreateContestHandler } from "@api/app/modules/contest/commands/handlers/create-contest.handler";
import { UpdateContestHandler } from "@api/app/modules/contest/commands/handlers/update-contest.handler";
import { JoinContestHandler } from "@api/app/modules/contest/commands/handlers/join-contest.handler";
import { AddProblemToContestHandler } from "@api/app/modules/contest/commands/handlers/add-problem.handler";
import { RemoveProblemFromContestHandler } from "@api/app/modules/contest/commands/handlers/remove-problem.handler";

@Module({
  imports: [CqrsModule, SubmissionModule],
  controllers: [ContestController],
  providers: [
    ContestService,
    GetContestsHandler,
    GetContestHandler,
    CreateContestHandler,
    UpdateContestHandler,
    JoinContestHandler,
    AddProblemToContestHandler,
    RemoveProblemFromContestHandler
  ],
  exports: [ContestService]
})
export class ContestModule {}
