import {
  httpSchemaCatalog,
  type HttpSchemaDescriptor,
  type HttpSchemaTarget,
} from "../../../../../packages/contracts/src/http/schemas.js";
import type { ApiValidationIssueDto } from "../../../../../packages/contracts/src/http/errors.js";
import type { HttpRouteSchemaSet } from "../../../../../packages/contracts/src/http/routes.js";

import {
  type BoundaryHttpHeaders,
  type BoundaryHttpResponse,
  requestIdFromHeaders,
  validationEnvelope,
  writeApiErrorResponse,
} from "@/interfaces/http/api-error-response.js";
import { matchHttpRoute } from "@/interfaces/http/http-route-match.js";
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
    const issues = validateRequest(request);
    if (issues.length === 0) {
      next();
      return;
    }

    const requestId = requestIdFromHeaders(request.headers);
    writeApiErrorResponse(response, validationEnvelope(issues, requestId));
  };
}

function validateRequest(request: BoundaryHttpRequest): readonly ApiValidationIssueDto[] {
  const match = matchHttpRoute(request.method ?? "GET", pathnameFromRequest(request));
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
