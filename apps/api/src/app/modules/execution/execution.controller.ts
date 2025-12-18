import { Body, Controller, Get, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import {
  ExecuteRequestDto,
  ExecuteResponseDto
} from "@api/app/modules/execution/dtos/execute.dtos";
import { ZodResponse } from "nestjs-zod";
import { ExecuteCommand } from "@api/app/modules/execution/commands/execute.command";

@Controller("v1/execute")
export class ExecutionController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @ZodResponse({ type: ExecuteResponseDto })
  async execute(@Body() body: ExecuteRequestDto): Promise<ExecuteResponseDto> {
    return this.commandBus.execute(new ExecuteCommand(body.code, body.language, body.problemId));
  }
}
