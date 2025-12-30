import { RedisProvider } from "@api/app/infrastructure/redis/redis.provider";
import { Module } from "@nestjs/common";

@Module({
  providers: [RedisProvider],
  exports: [RedisProvider]
})
export class RedisModule {}
