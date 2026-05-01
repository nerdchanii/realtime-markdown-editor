import type { INestApplication } from "@nestjs/common";

import { ApiExceptionFilter } from "@/interfaces/http/api-exception.filter.js";
import { createHttpRouteValidationMiddleware } from "@/interfaces/http/http-route-validation.middleware.js";

type BodyParserCapableApp = INestApplication & {
  useBodyParser(type: "json" | "urlencoded", options?: unknown): void;
};

const localDevelopmentCorsOrigins = ["http://127.0.0.1:5173", "http://localhost:5173"] as const;

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
  if (origins.length === 0) return true;
  if (process.env.NODE_ENV === "production") return origins;
  return [...new Set([...origins, ...localDevelopmentCorsOrigins])];
}
