import { PassCheckWorkerService } from "@api/app/infrastructure/worker/pass-check-pool.service";
import { Module } from "@nestjs/common";

@Module({
  providers: [PassCheckWorkerService],
  exports: [PassCheckWorkerService]
})
export class WorkerModule {}
