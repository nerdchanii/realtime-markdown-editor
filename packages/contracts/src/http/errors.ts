export type ApiErrorCodeDto =
  | "bad_request"
  | "conflict"
  | "forbidden"
  | "internal_error"
  | "not_found"
  | "unauthenticated"
  | "validation_failed";

export type ApiValidationIssueDto = Readonly<{
  path: readonly string[];
  message: string;
  code: string;
}>;

export type ApiErrorResponseDto = Readonly<{
  code: ApiErrorCodeDto;
  message: string;
  details?: readonly ApiValidationIssueDto[];
  requestId?: string;
}>;
