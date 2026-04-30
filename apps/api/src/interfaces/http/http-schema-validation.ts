import type {
  HttpSchemaDescriptor,
  HttpSchemaField,
  HttpSchemaFieldFormat,
  HttpSchemaFieldKind,
} from "../../../../../packages/contracts/src/http/schemas.js";
import type { ApiValidationIssueDto } from "../../../../../packages/contracts/src/http/errors.js";

type FieldValidator = (value: unknown, field: HttpSchemaField) => string | null;
type FormatValidator = Readonly<{
  isValid: (value: string) => boolean;
  message: string;
}>;

const fieldValidators = {
  array: validateArray,
  boolean: validateBoolean,
  enum: validateEnum,
  integer: validateInteger,
  object: validateObjectField,
  record: validateObjectField,
  string: validateString,
} satisfies Record<HttpSchemaFieldKind, FieldValidator>;

const formatValidators = {
  "content-type": { isValid: isContentType, message: "Expected a content type." },
  email: { isValid: isEmail, message: "Expected an email address." },
  "hex-sha256": { isValid: isSha256, message: "Expected a SHA-256 hex digest." },
  "http-url": { isValid: isHttpUrl, message: "Expected an HTTP URL." },
  "iso-date-time": { isValid: isIsoDateTime, message: "Expected an ISO date-time." },
  markdown: { isValid: isMarkdown, message: "Expected Markdown text." },
  "resource-id": { isValid: isResourceId, message: "Expected a resource id." },
  "safe-filename": { isValid: isSafeFilename, message: "Expected a safe filename." },
} satisfies Record<HttpSchemaFieldFormat, FormatValidator>;

export function validateHttpSchema(
  schema: HttpSchemaDescriptor,
  value: unknown,
): readonly ApiValidationIssueDto[] {
  const record = toRecord(value);
  if (!record) return [issue([schema.target], "Expected an object.", "invalid_type")];

  return schema.fields.flatMap((field) => validateField(schema, record, field));
}

function validateField(
  schema: HttpSchemaDescriptor,
  record: Readonly<Record<string, unknown>>,
  field: HttpSchemaField,
): readonly ApiValidationIssueDto[] {
  const value = record[field.name];
  if (value === undefined) return field.required ? [requiredIssue(schema, field)] : [];
  const message = fieldValidators[field.kind](value, field);
  return message ? [issue([schema.target, field.name], message, "invalid_value")] : [];
}

function validateString(value: unknown, field: HttpSchemaField): string | null {
  if (typeof value !== "string") return "Expected a string.";
  if (!meetsLengthBounds(value, field)) return "Expected a string within length bounds.";
  return validateFormat(value, field);
}

function validateArray(value: unknown): string | null {
  return Array.isArray(value) ? null : "Expected an array.";
}

function validateBoolean(value: unknown): string | null {
  return typeof value === "boolean" ? null : "Expected a boolean.";
}

function validateEnum(value: unknown, field: HttpSchemaField): string | null {
  if (typeof value !== "string") return "Expected an enum string.";
  return field.enumValues?.includes(value) ? null : "Expected a supported enum value.";
}

function validateInteger(value: unknown, field: HttpSchemaField): string | null {
  const numberValue = typeof value === "string" ? Number(value) : value;
  if (!Number.isInteger(numberValue)) return "Expected an integer.";
  return withinNumericBounds(numberValue as number, field) ? null : "Expected an integer in range.";
}

function validateObjectField(value: unknown): string | null {
  return toRecord(value) ? null : "Expected an object.";
}

function meetsLengthBounds(value: string, field: HttpSchemaField): boolean {
  const length = value.trim().length;
  if (field.minLength !== undefined && length < field.minLength) return false;
  if (field.maxLength !== undefined && length > field.maxLength) return false;
  return true;
}

function withinNumericBounds(value: number, field: HttpSchemaField): boolean {
  if (field.minimum !== undefined && value < field.minimum) return false;
  if (field.maximum !== undefined && value > field.maximum) return false;
  return true;
}

function validateFormat(value: string, field: HttpSchemaField): string | null {
  if (!field.format) return null;
  const validator = formatValidators[field.format];
  return validator.isValid(value) ? null : validator.message;
}

function toRecord(value: unknown): Readonly<Record<string, unknown>> | null {
  if (value === undefined || value === null) return {};
  if (typeof value !== "object" || Array.isArray(value)) return null;
  return value as Readonly<Record<string, unknown>>;
}

function requiredIssue(
  schema: HttpSchemaDescriptor,
  field: HttpSchemaField,
): ApiValidationIssueDto {
  return issue([schema.target, field.name], "Field is required.", "required");
}

function issue(path: readonly string[], message: string, code: string): ApiValidationIssueDto {
  return { path, message, code };
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}

function isContentType(value: string): boolean {
  return /^[^/\s]+\/[^;\s]+(?:;\s*[^=;\s]+=[^;]+)*$/.test(value);
}

function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value);
}

function isIsoDateTime(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

function isSafeFilename(value: string): boolean {
  return value.trim().length > 0 && !/[\\/\0]/.test(value);
}

function isMarkdown(): boolean {
  return true;
}

function isResourceId(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(value);
}
