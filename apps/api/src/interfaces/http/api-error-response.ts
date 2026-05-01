import { HttpException, HttpStatus } from "@nestjs/common";
import type {
  ApiErrorCodeDto,
  ApiErrorResponseDto,
  ApiValidationIssueDto,
} from "@rme/contracts/http";

export type BoundaryHttpHeaders = Readonly<Record<string, string | readonly string[] | undefined>>;

export type BoundaryHttpResponse = {
  headersSent?: boolean;
  setHeader(name: string, value: string): void;
  status(statusCode: number): BoundaryHttpResponse;
  json(body: ApiErrorResponseDto): void;
};

export type ApiErrorEnvelopeInput = Readonly<{
  statusCode: number;
  code: ApiErrorCodeDto;
  message: string;
  details?: readonly ApiValidationIssueDto[];
  requestId?: string;
}>;

export function requestIdFromHeaders(headers: BoundaryHttpHeaders): string | undefined {
  const value = headers["x-request-id"];
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value) && typeof value[0] === "string") return value[0].trim() || undefined;
  return undefined;
}

export function envelopeForException(
  exception: unknown,
  requestId?: string,
): ApiErrorEnvelopeInput {
  if (exception instanceof HttpException) {
    const statusCode = exception.getStatus();
    return createEnvelope(statusCode, messageFromHttpException(exception, statusCode), requestId);
  }

  return createEnvelope(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error.", requestId);
}

export function writeApiErrorResponse(
  response: BoundaryHttpResponse,
  input: ApiErrorEnvelopeInput,
): void {
  if (input.requestId) response.setHeader("X-Request-Id", input.requestId);
  response.status(input.statusCode).json(createBody(input));
}

export function validationEnvelope(
  details: readonly ApiValidationIssueDto[],
  requestId?: string,
): ApiErrorEnvelopeInput {
  return {
    statusCode: HttpStatus.BAD_REQUEST,
    code: "validation_failed",
    message: "Request validation failed.",
    details,
    ...(requestId ? { requestId } : {}),
  };
}

function createEnvelope(
  statusCode: number,
  message: string,
  requestId?: string,
): ApiErrorEnvelopeInput {
  return {
    statusCode,
    code: codeForStatus(statusCode),
    message,
    ...(requestId ? { requestId } : {}),
  };
}

function createBody(input: ApiErrorEnvelopeInput): ApiErrorResponseDto {
  return {
    code: input.code,
    message: input.message,
    ...(input.details ? { details: input.details } : {}),
    ...(input.requestId ? { requestId: input.requestId } : {}),
  };
}

function messageFromHttpException(exception: HttpException, statusCode: number): string {
  const response = exception.getResponse();
  if (typeof response === "string") return response;
  const message = messageFromResponseObject(response);
  return message ?? defaultMessageForStatus(statusCode);
}

function messageFromResponseObject(response: object): string | undefined {
  if (!("message" in response)) return undefined;
  const message = response.message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.filter(isString).join("; ");
  return undefined;
}

function codeForStatus(statusCode: number): ApiErrorCodeDto {
  if (statusCode === HttpStatus.BAD_REQUEST) return "bad_request";
  if (statusCode === HttpStatus.UNAUTHORIZED) return "unauthenticated";
  if (statusCode === HttpStatus.FORBIDDEN) return "forbidden";
  if (statusCode === HttpStatus.NOT_FOUND) return "not_found";
  if (statusCode === HttpStatus.CONFLICT) return "conflict";
  return "internal_error";
}

function defaultMessageForStatus(statusCode: number): string {
  if (statusCode === HttpStatus.BAD_REQUEST) return "Bad request.";
  if (statusCode === HttpStatus.UNAUTHORIZED) return "Authentication is required.";
  if (statusCode === HttpStatus.FORBIDDEN) return "Access is forbidden.";
  if (statusCode === HttpStatus.NOT_FOUND) return "Resource not found.";
  if (statusCode === HttpStatus.CONFLICT) return "Conflict.";
  return "Internal server error.";
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
