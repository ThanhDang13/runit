import { ExecutionModule } from "@api/app/modules/execution/execution.module";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { APP_PIPE, APP_INTERCEPTOR, APP_FILTER } from "@nestjs/core";
import { ZodValidationPipe, ZodSerializerInterceptor } from "nestjs-zod";
import { HttpExceptionFilter } from "@api/app/common/exceptions/http-exception.filter";
import { DrizzlePGModule } from "@knaadh/nestjs-drizzle-pg";
import { PGDatabaseConfigService } from "@api/app/infrastructure/database/database.service";
import { ProblemModule } from "@api/app/modules/problem/problem.module";
import { UserModule } from "@api/app/modules/user/user.module";
import { AuthModule } from "@api/app/modules/auth/auth.module";
import { SubmissionModule } from "@api/app/modules/submission/submission.module";
import { RedisModule } from "@api/app/infrastructure/redis/redis.module";
import { MailModule } from "@api/app/infrastructure/mailer/mailer.module";
import { ContestModule } from "@api/app/modules/contest/contest.module";

@Module({
  imports: [
    CqrsModule.forRoot(),
    DrizzlePGModule.registerAsync({
      tag: "PG",
      useClass: PGDatabaseConfigService
    }),
    AuthModule,
    ExecutionModule,
    ProblemModule,
    UserModule,
    SubmissionModule,
    ContestModule,
    RedisModule,
    MailModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ]
})
export class AppModule {}
