import {
  httpSchemaCatalog,
  type HttpSchemaDescriptor,
  type HttpRouteSchemaSet,
  type HttpSchemaTarget,
  type ApiValidationIssueDto,
} from "@rme/contracts/http";

import {
  type BoundaryHttpHeaders,
  type BoundaryHttpResponse,
  requestIdFromHeaders,
  validationEnvelope,
  writeApiErrorResponse,
} from "@/interfaces/http/api-error-response.js";
import { isDevSeedRouteEnabled } from "@/interfaces/http/dev-seed-route-gate.js";
import { matchHttpRoute, type MatchedHttpRoute } from "@/interfaces/http/http-route-match.js";
import { validateHttpSchema } from "@/interfaces/http/http-schema-validation.js";

type BoundaryHttpRequest = Readonly<{
  method?: string;
  path?: string;
  url?: string;
  headers: BoundaryHttpHeaders;
  query?: unknown;
  body?: unknown;
}>;

type BoundaryNext = () => void;
type BoundaryMiddleware = (
  request: BoundaryHttpRequest,
  response: BoundaryHttpResponse,
  next: BoundaryNext,
) => void;

const schemaById: ReadonlyMap<string, HttpSchemaDescriptor> = new Map(
  httpSchemaCatalog.map((schema) => [schema.id, schema]),
);

export function createHttpRouteValidationMiddleware(): BoundaryMiddleware {
  return (request, response, next) => {
    const requestId = requestIdFromHeaders(request.headers);
    const route = matchHttpRoute(request.method ?? "GET", pathnameFromRequest(request));
    if (isHiddenDevOnlyRoute(route)) {
      writeApiErrorResponse(response, notFoundEnvelope(requestId));
      return;
    }

    const issues = validateRequest(route, request);
    if (issues.length === 0) {
      next();
      return;
    }

    writeApiErrorResponse(response, validationEnvelope(issues, requestId));
  };
}

function isHiddenDevOnlyRoute(route: MatchedHttpRoute | null): boolean {
  return route?.route.audience === "dev-only" && !isDevSeedRouteEnabled();
}

function notFoundEnvelope(requestId: string | undefined) {
  return {
    statusCode: 404,
    code: "not_found" as const,
    message: "Resource not found.",
    ...(requestId ? { requestId } : {}),
  };
}

function validateRequest(
  match: MatchedHttpRoute | null,
  request: BoundaryHttpRequest,
): readonly ApiValidationIssueDto[] {
  if (!match) return [];

  return [
    ...validateTarget(match.route.schemas, "params", match.params),
    ...validateTarget(match.route.schemas, "query", request.query),
    ...validateTarget(match.route.schemas, "body", request.body),
  ];
}

function validateTarget(
  schemas: HttpRouteSchemaSet,
  target: HttpSchemaTarget,
  value: unknown,
): readonly ApiValidationIssueDto[] {
  const schema = schemaForTarget(schemas, target);
  return schema ? validateHttpSchema(schema, value) : [];
}

function schemaForTarget(
  schemas: HttpRouteSchemaSet,
  target: HttpSchemaTarget,
): HttpSchemaDescriptor | null {
  const schemaId = schemas[target];
  if (!schemaId) return null;
  return schemaById.get(schemaId) ?? null;
}

function pathnameFromRequest(request: BoundaryHttpRequest): string {
  const path = request.path ?? request.url ?? "/";
  return path.split("?")[0] ?? "/";
}
