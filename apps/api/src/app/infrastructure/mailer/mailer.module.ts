import { MailProvider } from "@api/app/infrastructure/mailer/mailer.provider";
import { Module } from "@nestjs/common";

@Module({
  providers: [MailProvider],
  exports: [MailProvider]
})
export class MailModule {}
