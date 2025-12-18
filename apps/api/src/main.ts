import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { loggerOptions } from "@api/app/infrastructure/logger/pino.options";
import { env } from "@api/app/infrastructure/config/env.config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: loggerOptions })
  );

  app.setGlobalPrefix("api");
  // app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();
  app.enableShutdownHooks();

  // const reflector = app.get(Reflector);

  // app.useGlobalGuards(new RolesGuard(reflector));

  const port = env.PORT;

  const config = new DocumentBuilder()
    .setTitle("Runit API")
    .setDescription("The Runit API description")
    .setVersion("1.0")
    .addTag("Default")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT token (no 'Bearer ' prefix needed)",
        in: "header",
        name: "Authorization"
      },
      "Bearer"
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, cleanupOpenApiDoc(documentFactory()));

  await app.listen(port, "0.0.0.0");

  Logger.log(`🚀 Application is running on: http://localhost:${port}/api`);

  process.on("SIGINT", async () => {
    await app.close();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await app.close();
    process.exit(0);
  });
}
bootstrap();
