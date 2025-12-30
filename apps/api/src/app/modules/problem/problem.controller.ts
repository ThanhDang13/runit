import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { z } from "zod";
import { ZodResponse } from "nestjs-zod";
import { GetProblemsQuery } from "@api/app/modules/problem/queries/get-problems.query";
import {
  GetProblemsRequestQueryDto,
  GetProblemsResponseDto
} from "@api/app/modules/problem/dtos/get-problems.dtos";
import { OffsetPaginated, Paginated } from "@api/app/common/types/pagination";
// import { Problem } from "@api/app/modules/problem/queries/types";
import {
  GetProblemByIdRequestParamsDto,
  GetProblemByIdResponseDto
} from "@api/app/modules/problem/dtos/get-problem-by-id.dtos";
import { GetProblemByIdQuery } from "@api/app/modules/problem/queries/get-problem-by-id.query";
import { ProblemWithTestcases, Problem } from "@api/app/modules/problem/dtos/common";
import { CreateProblemCommand } from "@api/app/modules/problem/commands/create-problem.command";
import {
  CreateProblemRequestBodyDto,
  CreateProblemResponseDto
} from "@api/app/modules/problem/dtos/create-problem.dtos";
import {
  UpdateProblemRequestParamsDto,
  UpdateProblemRequestBodyDto,
  UpdateProblemResponseDto
} from "@api/app/modules/problem/dtos/update-problem.dtos";
import { UpdateProblemCommand } from "@api/app/modules/problem/commands/update-problem.command";
import {
  DeleteProblemRequestParamsDto,
  DeleteProblemResponseDto
} from "@api/app/modules/problem/dtos/delete-problem.dtos";
import { DeleteProblemCommand } from "@api/app/modules/problem/commands/delete-problem.command";
import { FastifyRequest } from "fastify";
import { JwtStrategy } from "@api/app/modules/auth/strategy/jwt.strategy";
import { OptionalJwtAuthGuard } from "@api/app/modules/auth/strategy/optional.guard";

@Controller("v1/problems")
export class ProblemController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @Get()
  @ZodResponse({ type: GetProblemsResponseDto })
  @UseGuards(OptionalJwtAuthGuard)
  async getProblems(
    @Req() req: FastifyRequest,
    @Query() query: GetProblemsRequestQueryDto
  ): Promise<OffsetPaginated<Problem>> {
    const paging = {
      type: query.type,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      order: query.order
    };

    return this.queryBus.execute(
      new GetProblemsQuery(paging, query.keyword, query.difficulty, req.user?.id)
    );
  }

  @Get(":id")
  @ZodResponse({ type: GetProblemByIdResponseDto })
  @UseGuards(OptionalJwtAuthGuard)
  async getProblemById(
    @Req() req: FastifyRequest,
    @Param() params: GetProblemByIdRequestParamsDto
  ): Promise<ProblemWithTestcases> {
    return this.queryBus.execute(new GetProblemByIdQuery(params.id, req.user.role === "admin"));
  }

  @Post()
  @ZodResponse({ type: CreateProblemResponseDto })
  async createProblem(@Body() body: CreateProblemRequestBodyDto): Promise<Problem> {
    return this.commandBus.execute(new CreateProblemCommand(body));
  }

  @Put(":id")
  @ZodResponse({ type: UpdateProblemResponseDto })
  async updateProblem(
    @Param() params: UpdateProblemRequestParamsDto,
    @Body() body: UpdateProblemRequestBodyDto
  ): Promise<Problem> {
    return this.commandBus.execute(new UpdateProblemCommand(params.id, body));
  }

  @Delete(":id")
  @ZodResponse({ type: DeleteProblemResponseDto })
  async deleteProblem(@Param() params: DeleteProblemRequestParamsDto): Promise<{ id: string }> {
    return this.commandBus.execute(new DeleteProblemCommand(params.id));
  }
}
