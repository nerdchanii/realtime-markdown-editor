import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "@/app.module.js";
import { configureHttpBoundary } from "@/interfaces/http/http-boundary.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureHttpBoundary(app);
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
}

await bootstrap();
