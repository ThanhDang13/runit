import pino from "pino";
import { FastifyLoggerOptions } from "fastify";
import { env } from "@api/app/infrastructure/config/env.config";

const stream =
  env.NODE_ENV !== "production" ? pino.transport({ target: "pino-pretty" }) : process.stdout;

export const loggerOptions: FastifyLoggerOptions = {
  level: env.NODE_ENV === "production" ? "info" : "debug",
  stream
};
