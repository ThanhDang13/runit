import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { availableParallelism, FixedThreadPool, PoolEvents } from "poolifier";
import path from "node:path";
import type {
  PassCheckTask,
  PassCheckResult
} from "@api/app/infrastructure/worker/check-pass.worker";

@Injectable()
export class PassCheckWorkerService implements OnModuleInit, OnModuleDestroy {
  private pool: FixedThreadPool<PassCheckTask, PassCheckResult>;
  private readonly logger = new Logger(PassCheckWorkerService.name);

  onModuleInit() {
    const workerPath = path.resolve(__dirname, "../api-worker/check-pass.worker.js");
    this.pool = new FixedThreadPool(availableParallelism(), workerPath, {
      errorHandler: (err) => this.logger.error(err)
    });
    this.pool.emitter?.on(PoolEvents.ready, () => this.logger.log("Pool is ready"));
    this.pool.emitter?.on(PoolEvents.busy, () => this.logger.log("Pool is busy"));
  }

  async onModuleDestroy() {
    await this.pool.destroy();
  }

  async execute(task: PassCheckTask) {
    if (!this.pool) throw new Error("Pool not initialized");

    try {
      return await this.pool.execute(task);
    } catch (err) {
      this.logger.warn("Temporary worker selection error, retrying...", err);
      return await this.pool.execute(task);
    }
  }
}
