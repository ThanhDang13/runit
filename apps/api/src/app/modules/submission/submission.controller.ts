import { OffsetPaginated } from "@api/app/common/types/pagination";
import { JwtAuthGuard } from "@api/app/modules/auth/strategy/jwt.guard";
import { IsUser, ROLES, Roles } from "@api/app/modules/auth/strategy/role.guard";
import { SubmitCodeCommand } from "@api/app/modules/submission/commands/submit-code.command";
import { Submission } from "@api/app/modules/submission/dtos/common.dtos";
import {
  GetSubmissionsRequestQueryDto,
  GetSubmissionsResponseDto
} from "@api/app/modules/submission/dtos/get-submissions.dtos";
import {
  SubmitCodeRequestDto,
  SubmitCodeResponseDto
} from "@api/app/modules/submission/dtos/submit-code.dtos";
import { GetSubmissionsQuery } from "@api/app/modules/submission/queries/get-submissions.query";
import { Body, Controller, Get, Post, Query, Req } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { FastifyRequest } from "fastify";
import { ZodResponse } from "nestjs-zod";

@Controller("v1/submissions")
export class SubmissionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get()
  // @IsUser()
  @ZodResponse({ type: GetSubmissionsResponseDto })
  async getSubmissions(
    @Req() req: FastifyRequest,
    @Query() query: GetSubmissionsRequestQueryDto
  ): Promise<OffsetPaginated<Submission>> {
    const paging = {
      type: query.type,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      order: query.order
    };
    const userId = query.userId;

    return this.queryBus.execute(
      new GetSubmissionsQuery(paging, userId, query.problemId, query.language, query.status)
    );
  }

  @Post("/submit")
  @IsUser()
  @ZodResponse({ type: SubmitCodeResponseDto })
  async submitCode(
    @Req() req: FastifyRequest,
    @Body() body: SubmitCodeRequestDto
  ): Promise<SubmitCodeResponseDto> {
    const summary = await this.commandBus.execute(
      new SubmitCodeCommand(body.code, body.language, body.problemId, req.user.id)
    );
    return summary;
  }
}
