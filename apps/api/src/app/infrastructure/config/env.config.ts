import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();
const envSchema = z.object({
  NODE_ENV: z.literal(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  SERVER_URL: z.string().default("http://localhost"),

  // Database
  // DB_HOST: z.string(),
  // DB_PORT: z.string().default("5432"),
  // DB_USER: z.string(),
  // DB_PASSWORD: z.string(),
  // DB_NAME: z.string(),
  DATABASE_URL: z.coerce.string().default("postgresql://user:password@localhost:5432/runit"),

  // Redis / Queue
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.number().default(6379),

  // JWT / Auth
  JWT_SECRET: z.string().default("dev-secret"),
  JWT_EXPIRATION: z.any().default("1h"),

  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_SECURE: z.coerce.boolean().default(false)
});

export const env = envSchema.parse(process.env);
