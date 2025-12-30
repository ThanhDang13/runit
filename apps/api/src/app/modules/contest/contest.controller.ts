import {
  Controller,
  Get,
  Post,
  Req,
  Query,
  Param,
  Body,
  Patch,
  Delete,
  UseGuards
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { FastifyRequest } from "fastify";
import { SubmitCodeCommand } from "@api/app/modules/submission/commands/submit-code.command";
import { ZodResponse } from "nestjs-zod";
import { IsAdmin, IsUser } from "@api/app/modules/auth/strategy/role.guard";
import {
  GetContestResponseDto,
  GetContestsRequestQueryDto,
  GetContestsResponseDto
} from "@api/app/modules/contest/dtos/get-contests.dtos";
import { GetContestsQuery } from "@api/app/modules/contest/queries/get-contests.query";
import {
  CreateContestRequestDto,
  CreateContestResponseDto
} from "@api/app/modules/contest/dtos/create-contest.dtos";
import { CreateContestCommand } from "@api/app/modules/contest/commands/create-contest.command";
import {
  UpdateContestRequestDto,
  UpdateContestResponseDto
} from "@api/app/modules/contest/dtos/update-contest.dtos";
import { UpdateContestCommand } from "@api/app/modules/contest/commands/update-contest.command";
import { GetContestQuery } from "@api/app/modules/contest/queries/get-contest.query";
import {
  GetContestSubmissionsRequestQueryDto,
  GetContestSubmissionsResponseDto
} from "@api/app/modules/contest/dtos/get-contest-submissions.dtos";
import { GetSubmissionsQuery } from "@api/app/modules/submission/queries/get-submissions.query";
import { JoinContestResponseDto } from "@api/app/modules/contest/dtos/join-contest.dtos";
import { JoinContestCommand } from "@api/app/modules/contest/commands/join-contest.command";
import {
  SubmitCodeRequestDto,
  SubmitCodeResponseDto
} from "@api/app/modules/submission/dtos/submit-code.dtos";
import {
  AddProblemToContestRequestDto,
  AddProblemToContestResponseDto,
  RemoveProblemFromContestResponseDto
} from "@api/app/modules/contest/dtos/contest-problem.dtos";
import { AddProblemToContestCommand } from "@api/app/modules/contest/commands/add-problem.command";
import { RemoveProblemFromContestCommand } from "@api/app/modules/contest/commands/remove-problem.command";
import { OptionalJwtAuthGuard } from "@api/app/modules/auth/strategy/optional.guard";

@Controller("v1/contests")
export class ContestController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get()
  @ZodResponse({ type: GetContestsResponseDto })
  async getContests(@Query() query: GetContestsRequestQueryDto) {
    const paging = {
      type: query.type,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      order: query.order
    };

    return this.queryBus.execute(new GetContestsQuery(paging));
  }

  @Post()
  @IsAdmin()
  @ZodResponse({ type: CreateContestResponseDto })
  async createContest(@Body() body: CreateContestRequestDto) {
    return this.commandBus.execute(
      new CreateContestCommand(body.title, body.description, body.startTime, body.endTime)
    );
  }

  @Patch("/:id")
  @IsAdmin()
  @ZodResponse({ type: UpdateContestResponseDto })
  async updateContest(@Param("id") contestId: string, @Body() body: UpdateContestRequestDto) {
    const contest = await this.commandBus.execute(new UpdateContestCommand(contestId, body));
    return contest;
  }

  @Get("/:id")
  @UseGuards(OptionalJwtAuthGuard)
  @ZodResponse({ type: GetContestResponseDto })
  async getContest(@Param("id") contestId: string, @Req() req: FastifyRequest) {
    return this.queryBus.execute(new GetContestQuery(contestId, req.user?.id ?? undefined));
  }

  @Get("/:id/submissions")
  @UseGuards(OptionalJwtAuthGuard)
  @ZodResponse({ type: GetContestSubmissionsResponseDto })
  async getContestSubmissions(
    @Param("id") contestId: string,
    @Query() query: GetContestSubmissionsRequestQueryDto,
    @Req() req: FastifyRequest
  ) {
    const paging = {
      type: query.type,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      order: query.order
    };
    return this.queryBus.execute(
      new GetSubmissionsQuery(
        paging,
        undefined,
        undefined,
        query.language,
        query.status,
        contestId,
        req.user?.id ?? undefined
      )
    );
  }

  @Post("/:id/join")
  @IsUser()
  @ZodResponse({ type: JoinContestResponseDto })
  async joinContest(@Req() req: FastifyRequest, @Param("id") contestId: string) {
    return this.commandBus.execute(new JoinContestCommand(contestId, req.user.id));
  }

  @Post("/:id/submit")
  @IsUser()
  @ZodResponse({ type: SubmitCodeResponseDto })
  async submitCode(
    @Req() req: FastifyRequest,
    @Param("id") contestId: string,
    @Body() body: SubmitCodeRequestDto
  ): Promise<SubmitCodeResponseDto> {
    return this.commandBus.execute(
      new SubmitCodeCommand(body.code, body.language, body.problemId, req.user.id, contestId)
    );
  }

  @Post("/:id/problems")
  @IsAdmin()
  @ZodResponse({ type: AddProblemToContestResponseDto })
  async addProblem(@Param("id") contestId: string, @Body() body: AddProblemToContestRequestDto) {
    return this.commandBus.execute(
      new AddProblemToContestCommand(contestId, body.problemId, body.order)
    );
  }

  @Delete("/:id/problems/:problemId")
  @IsAdmin()
  @ZodResponse({ type: RemoveProblemFromContestResponseDto })
  async removeProblem(@Param("id") contestId: string, @Param("problemId") problemId: string) {
    return this.commandBus.execute(new RemoveProblemFromContestCommand(contestId, problemId));
  }
}
