import type { INestApplication } from "@nestjs/common";

import { ApiExceptionFilter } from "@/interfaces/http/api-exception.filter.js";
import { createHttpRouteValidationMiddleware } from "@/interfaces/http/http-route-validation.middleware.js";

type BodyParserCapableApp = INestApplication & {
  useBodyParser(type: "json" | "urlencoded", options?: unknown): void;
};

export function configureHttpBoundary(app: INestApplication): void {
  app.enableCors({
    origin: configuredCorsOrigins(),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id"],
  });
  const bodyParserApp = app as BodyParserCapableApp;
  bodyParserApp.useBodyParser("json");
  bodyParserApp.useBodyParser("urlencoded", { extended: true });
  app.use(createHttpRouteValidationMiddleware());
  app.useGlobalFilters(new ApiExceptionFilter());
}

function configuredCorsOrigins(): true | readonly string[] {
  const configured = process.env.RME_API_CORS_ORIGIN;
  if (!configured) return true;
  const origins = configured
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : true;
}
