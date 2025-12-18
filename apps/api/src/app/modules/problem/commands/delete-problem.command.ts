import { Command } from "@nestjs/cqrs";

export class DeleteProblemCommand extends Command<{
  id: string;
}> {
  constructor(public readonly problemId: string) {
    super();
  }
}
