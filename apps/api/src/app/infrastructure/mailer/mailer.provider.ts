import { env } from "@api/app/infrastructure/config/env.config";
import nodemailer from "nodemailer";

export const MailProvider = {
  provide: "MAILER",
  useFactory: () => {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    });
  }
};
