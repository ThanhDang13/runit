import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { AuthController } from "@api/app/modules/auth/auth.controller";
import { LoginHandler } from "@api/app/modules/auth/commands/handlers/login.handler";
import { SignupHandler } from "@api/app/modules/auth/commands/handlers/signup.handler";
import { PGDatabase } from "@api/app/infrastructure/database/database.service";
import { JwtModule } from "@nestjs/jwt";
import { env } from "@api/app/infrastructure/config/env.config";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "@api/app/modules/auth/strategy/jwt.strategy";
import { JwtAuthGuard } from "@api/app/modules/auth/strategy/jwt.guard";
import { RolesGuard } from "@api/app/modules/auth/strategy/role.guard";

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.JWT_EXPIRATION }
    })
  ],
  controllers: [AuthController],
  providers: [LoginHandler, SignupHandler, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [JwtStrategy, JwtAuthGuard, RolesGuard, PassportModule]
})
export class AuthModule {}
