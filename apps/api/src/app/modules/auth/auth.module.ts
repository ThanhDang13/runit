import { Module, Res } from "@nestjs/common";
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
import { ChangePasswordHandler } from "@api/app/modules/user/commands/handlers/change-password.handler";
import { ForgotPasswordHandler } from "@api/app/modules/auth/commands/handlers/forgot-password.handler";
import { ResetPasswordHandler } from "@api/app/modules/auth/commands/handlers/reset-password.handler";
import { RedisModule } from "@api/app/infrastructure/redis/redis.module";
import { MailModule } from "@api/app/infrastructure/mailer/mailer.module";
import { VerifyEmailHandler } from "@api/app/modules/auth/commands/handlers/verify-email.handler";
import { ResendVerificationHandler } from "@api/app/modules/auth/commands/handlers/resend-verification.handler";

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.JWT_EXPIRATION }
    }),
    RedisModule,
    MailModule
  ],
  controllers: [AuthController],
  providers: [
    LoginHandler,
    SignupHandler,
    ChangePasswordHandler,
    ForgotPasswordHandler,
    ResetPasswordHandler,
    VerifyEmailHandler,
    ResendVerificationHandler,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard
  ],
  exports: [JwtStrategy, JwtAuthGuard, RolesGuard, PassportModule]
})
export class AuthModule {}
