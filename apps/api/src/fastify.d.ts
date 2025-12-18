import type { JwtPayload } from "@api/app/modules/auth/strategy/jwt.strategy";
import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: JwtPayload;
  }
}
