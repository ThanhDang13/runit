import { Problem } from "@api/app/modules/problem/dtos/common";
import { CreateProblemRequestBodyDto } from "@api/app/modules/problem/dtos/create-problem.dtos";
import { Command } from "@nestjs/cqrs";

export class CreateProblemCommand extends Command<Problem> {
  constructor(public readonly data: CreateProblemRequestBodyDto) {
    super();
  }
}
