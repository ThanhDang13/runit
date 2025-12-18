import { EngineModule } from "@api/app/infrastructure/engine/engine.module";
import { WorkerModule } from "@api/app/infrastructure/worker/worker.module";
import { ExecuteHandler } from "@api/app/modules/execution/commands/handlers/execute.handler";
import { ExecutionController } from "@api/app/modules/execution/execution.controller";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";

@Module({
  imports: [CqrsModule, EngineModule, WorkerModule],
  controllers: [ExecutionController],
  providers: [ExecuteHandler]
})
export class ExecutionModule {}
