import { env } from "@api/app/infrastructure/config/env.config";
import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [() => env],
      isGlobal: true
    })
  ]
})
export class ConfigModule {}
