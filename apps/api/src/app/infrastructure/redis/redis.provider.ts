import { env } from "@api/app/infrastructure/config/env.config";
import Redis from "ioredis";

export const RedisProvider = {
  provide: "REDIS",
  useFactory: () => {
    return new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT
    });
  }
};
