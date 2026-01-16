import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { PistonEngineService } from "@api/app/infrastructure/engine/piston.service";
import { PassCheckWorkerService } from "@api/app/infrastructure/worker/pass-check-pool.service";
import { ExecuteCommand } from "@api/app/modules/execution/commands/execute.command";
import { ExecutionSummary } from "@api/app/modules/execution/dtos/common";

import { Inject, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler, EventBus } from "@nestjs/cqrs";
import { and, eq } from "drizzle-orm";
import { availableParallelism } from "poolifier";
import { from, lastValueFrom } from "rxjs";
import { mergeMap, map, toArray, catchError } from "rxjs/operators";
import { Prettify } from "zod/v4/core/util.cjs";

@CommandHandler(ExecuteCommand)
export class ExecuteHandler implements ICommandHandler<ExecuteCommand> {
  constructor(
    private readonly engine: PistonEngineService,
    private readonly worker: PassCheckWorkerService,
    @Inject("PG") private readonly db: PGDatabase
  ) {}

  async execute(command: ExecuteCommand): Promise<ExecutionSummary> {
    const { code, language, problemId, isSubmitted } = command;

    const tests = await this.db.query.testcases.findMany({
      where: (tc) =>
        isSubmitted
          ? eq(tc.problemId, problemId)
          : and(eq(tc.problemId, problemId), eq(tc.isSample, true))
    });
    const passResults = await lastValueFrom(
      from(tests).pipe(
        mergeMap(async (test) => {
          const execResult = await this.engine.execute(code, language, test.input);
          const { output, exitCode } = execResult;

          if (exitCode === null) {
            return {
              execResult: {
                input: test.input,
                output: "",
                expected: test.expectedOutput,
                isSample: test.isSample,
                status: "TLE",
                passed: false
              }
            };
          }

          if (exitCode !== 0) {
            return {
              execResult: {
                input: test.input,
                output: output?.trim() ?? "",
                expected: test.expectedOutput,
                isSample: test.isSample,
                status: "RE",
                passed: false
              }
            };
          }

          return {
            execResult: {
              input: test.input,
              output: output.trim(),
              expected: test.expectedOutput,
              status: "RUN_OK",
              isSample: test.isSample
            }
          };
        }),
        mergeMap(async ({ execResult }) => {
          if (execResult.status !== "RUN_OK") return { ...execResult, passed: false };

          const passResult = await this.worker.execute({
            output: execResult.output,
            expected: execResult.expected
          });
          return {
            ...execResult,
            passed: passResult?.passed ?? false,
            status: passResult?.passed ? "AC" : "WA"
          };
        }, availableParallelism()),
        toArray(),
        map((results) => {
          const verdict = results.some((r) => r.status === "TLE")
            ? "TIME_LIMIT_EXCEEDED"
            : results.some((r) => r.status === "RE")
              ? "RUNTIME_ERROR"
              : results.some((r) => r.status === "WA")
                ? "WRONG_ANSWER"
                : "ACCEPTED";
          const total = results.length;
          const totalPassed = results.filter((r) => r.passed).length;
          return { verdict, total, totalPassed, results: results.filter((r) => r.isSample) };
        })
      )
    );

    return passResults;
  }
}
