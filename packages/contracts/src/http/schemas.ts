/* eslint-disable max-lines */

export type HttpSchemaTarget = "params" | "query" | "body" | "multipart" | "response";

export type HttpSchemaFieldKind =
  | "array"
  | "boolean"
  | "enum"
  | "integer"
  | "object"
  | "record"
  | "string";

export type HttpSchemaFieldFormat =
  | "content-type"
  | "email"
  | "hex-sha256"
  | "http-url"
  | "iso-date-time"
  | "markdown"
  | "resource-id"
  | "safe-filename";

export type HttpSchemaRef = string;

export type HttpSchemaField = Readonly<{
  name: string;
  kind: HttpSchemaFieldKind;
  required: boolean;
  format?: HttpSchemaFieldFormat;
  enumValues?: readonly string[];
  itemSchema?: HttpSchemaRef;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
}>;

export type HttpSchemaDescriptor = Readonly<{
  id: HttpSchemaRef;
  dto: string;
  target: HttpSchemaTarget;
  fields: readonly HttpSchemaField[];
  notes?: readonly string[];
}>;

export type HttpRuntimeSchemaStrategy = Readonly<{
  sourceOfTruth: "@rme/contracts/http";
  descriptorCatalog: "httpSchemaCatalog";
  validationOwnerTask: "TASK-073";
  boundaryOwner: "apps/api";
  dtoPolicy: string;
  runtimePolicy: readonly string[];
}>;

export const httpRuntimeSchemaStrategy = {
  sourceOfTruth: "@rme/contracts/http",
  descriptorCatalog: "httpSchemaCatalog",
  validationOwnerTask: "TASK-073",
  boundaryOwner: "apps/api",
  dtoPolicy:
    "DTOs remain provider-neutral TypeScript wire contracts; runtime validators must be generated or mapped from the HTTP schema descriptors rather than domain classes or provider SDK types.",
  runtimePolicy: [
    "Validate route params, query, body, and multipart metadata at the API boundary before use-case execution.",
    "Return ApiErrorResponseDto through the centralized TASK-073 error envelope for validation, auth, authorization, and resource errors.",
    "Do not place class-validator decorators, Zod objects, Prisma models, Yjs/Hocuspocus types, or storage provider types inside domain files.",
    "Public product routes derive current user and membership from the httpOnly session; request DTOs must not trust memberId or authorMembershipId for product actions.",
    "Dev-only seed/review routes may expose local reviewer bootstrap data but must stay out of the normal product runtime path.",
  ],
} as const satisfies HttpRuntimeSchemaStrategy;

export const httpSchemaCatalog = [
  {
    id: "CreateAccountRequest",
    dto: "CreateAccountRequestDto",
    target: "body",
    fields: [
      { name: "email", kind: "string", required: true, format: "email" },
      { name: "name", kind: "string", required: true, minLength: 1 },
      { name: "password", kind: "string", required: true, minLength: 8 },
    ],
  },
  {
    id: "UserResponse",
    dto: "UserResponseDto",
    target: "response",
    fields: [{ name: "user", kind: "object", required: true }],
  },
  {
    id: "CreateSessionRequest",
    dto: "CreateSessionRequestDto",
    target: "body",
    fields: [
      { name: "email", kind: "string", required: true, format: "email" },
      { name: "password", kind: "string", required: true, minLength: 1 },
      { name: "workspaceId", kind: "string", required: false },
    ],
  },
  {
    id: "WorkspaceIdPathParams",
    dto: "WorkspaceIdPathParamsDto",
    target: "params",
    fields: [{ name: "workspaceId", kind: "string", required: true, format: "resource-id" }],
  },
  {
    id: "ProjectIdPathParams",
    dto: "ProjectIdPathParamsDto",
    target: "params",
    fields: [{ name: "projectId", kind: "string", required: true, format: "resource-id" }],
  },
  {
    id: "FolderIdPathParams",
    dto: "FolderIdPathParamsDto",
    target: "params",
    fields: [{ name: "folderId", kind: "string", required: true, format: "resource-id" }],
  },
  {
    id: "DocumentIdPathParams",
    dto: "DocumentIdPathParamsDto",
    target: "params",
    fields: [{ name: "documentId", kind: "string", required: true, format: "resource-id" }],
  },
  {
    id: "CheckpointIdPathParams",
    dto: "CheckpointIdPathParamsDto",
    target: "params",
    fields: [{ name: "checkpointId", kind: "string", required: true, format: "resource-id" }],
  },
  {
    id: "CollaborationSessionQuery",
    dto: "CollaborationSessionQueryDto",
    target: "query",
    fields: [{ name: "memberId", kind: "string", required: false, format: "resource-id" }],
  },
  {
    id: "CreateWorkspaceRequest",
    dto: "CreateWorkspaceRequestDto",
    target: "body",
    fields: [{ name: "name", kind: "string", required: true, minLength: 1 }],
  },
  {
    id: "UpdateWorkspaceRequest",
    dto: "UpdateWorkspaceRequestDto",
    target: "body",
    fields: [{ name: "name", kind: "string", required: false, minLength: 1 }],
  },
  {
    id: "CreateProjectRequest",
    dto: "CreateProjectRequestDto",
    target: "body",
    fields: [{ name: "name", kind: "string", required: true, minLength: 1 }],
  },
  {
    id: "UpdateProjectRequest",
    dto: "UpdateProjectRequestDto",
    target: "body",
    fields: [{ name: "name", kind: "string", required: false, minLength: 1 }],
  },
  {
    id: "CreateFolderRequest",
    dto: "CreateFolderRequestDto",
    target: "body",
    fields: [
      { name: "name", kind: "string", required: true, minLength: 1 },
      { name: "parentFolderId", kind: "string", required: true },
    ],
  },
  {
    id: "UpdateFolderRequest",
    dto: "UpdateFolderRequestDto",
    target: "body",
    fields: [{ name: "name", kind: "string", required: false, minLength: 1 }],
  },
  {
    id: "MoveFolderRequest",
    dto: "MoveFolderRequestDto",
    target: "body",
    fields: [{ name: "targetParentFolderId", kind: "string", required: true }],
  },
  {
    id: "CreateDocumentRequest",
    dto: "CreateDocumentRequestDto",
    target: "body",
    fields: [
      { name: "title", kind: "string", required: true, minLength: 1 },
      { name: "initialMarkdownBody", kind: "string", required: false, format: "markdown" },
      {
        name: "state",
        kind: "enum",
        required: false,
        enumValues: ["draft", "review", "saved"],
      },
      {
        name: "properties",
        kind: "array",
        required: false,
        itemSchema: "DocumentPropertyDto",
      },
    ],
  },
  {
    id: "UpdateDocumentRequest",
    dto: "UpdateDocumentRequestDto",
    target: "body",
    fields: [
      { name: "title", kind: "string", required: false, minLength: 1 },
      {
        name: "state",
        kind: "enum",
        required: false,
        enumValues: ["draft", "review", "saved"],
      },
    ],
  },
  {
    id: "MoveDocumentRequest",
    dto: "MoveDocumentRequestDto",
    target: "body",
    fields: [{ name: "targetFolderId", kind: "string", required: true }],
  },
  {
    id: "UpdateDocumentContentRequest",
    dto: "UpdateDocumentContentRequestDto",
    target: "body",
    fields: [
      { name: "markdownBody", kind: "string", required: true, format: "markdown" },
      { name: "baseRevisionId", kind: "string", required: false },
      {
        name: "source",
        kind: "enum",
        required: true,
        enumValues: ["collaboration-projection", "manual-import"],
      },
    ],
    notes: [
      "This route updates the current Markdown projection; export and checkpoint routes must resolve current content server-side instead of accepting full snapshot bodies.",
    ],
  },
  {
    id: "ReplaceDocumentPropertiesRequest",
    dto: "ReplaceDocumentPropertiesRequestDto",
    target: "body",
    fields: [
      {
        name: "properties",
        kind: "array",
        required: true,
        itemSchema: "DocumentPropertyDto",
      },
    ],
  },
  {
    id: "CreateCheckpointRequest",
    dto: "CreateCheckpointRequestDto",
    target: "body",
    fields: [{ name: "message", kind: "string", required: true, minLength: 1 }],
    notes: [
      "Current author membership and Markdown snapshot are resolved by the server from the authenticated session and current content projection.",
    ],
  },
  {
    id: "CreateMarkdownExportRequest",
    dto: "CreateMarkdownExportRequestDto",
    target: "body",
    fields: [
      {
        name: "filename",
        kind: "string",
        required: false,
        format: "safe-filename",
      },
    ],
  },
  {
    id: "CreateImageUploadRequest",
    dto: "CreateImageUploadRequestDto",
    target: "multipart",
    fields: [
      { name: "file", kind: "object", required: true },
      { name: "altText", kind: "string", required: false },
    ],
    notes: [
      "The multipart file part maps to MultipartFilePartDto metadata; binary bytes stay in the API adapter boundary.",
    ],
  },
  {
    id: "CreateCollaborationSessionRequest",
    dto: "CreateCollaborationSessionRequestDto",
    target: "body",
    fields: [{ name: "clientId", kind: "string", required: false }],
  },
  {
    id: "SessionResponse",
    dto: "SessionResponseDto",
    target: "response",
    fields: [{ name: "session", kind: "object", required: true }],
  },
  {
    id: "EmptyResponse",
    dto: "EmptyResponseDto",
    target: "response",
    fields: [],
  },
  {
    id: "WorkspaceResponse",
    dto: "WorkspaceResponseDto",
    target: "response",
    fields: [{ name: "workspace", kind: "object", required: true }],
  },
  {
    id: "ListWorkspacesResponse",
    dto: "ListWorkspacesResponseDto",
    target: "response",
    fields: [{ name: "workspaces", kind: "array", required: true, itemSchema: "WorkspaceDto" }],
  },
  {
    id: "ProjectResponse",
    dto: "ProjectResponseDto",
    target: "response",
    fields: [{ name: "project", kind: "object", required: true }],
  },
  {
    id: "ListProjectsResponse",
    dto: "ListProjectsResponseDto",
    target: "response",
    fields: [{ name: "projects", kind: "array", required: true, itemSchema: "ProjectDto" }],
  },
  {
    id: "FolderResponse",
    dto: "FolderResponseDto",
    target: "response",
    fields: [{ name: "folder", kind: "object", required: true }],
  },
  {
    id: "WorkspaceNavigationResponse",
    dto: "WorkspaceNavigationResponseDto",
    target: "response",
    fields: [
      { name: "workspace", kind: "object", required: true },
      { name: "projects", kind: "array", required: true, itemSchema: "ProjectDto" },
      { name: "folders", kind: "array", required: true, itemSchema: "FolderDto" },
      { name: "documents", kind: "array", required: true, itemSchema: "DocumentSummaryDto" },
    ],
  },
  {
    id: "FolderChildrenResponse",
    dto: "FolderChildrenResponseDto",
    target: "response",
    fields: [
      { name: "folder", kind: "object", required: true },
      { name: "folders", kind: "array", required: true, itemSchema: "FolderDto" },
      { name: "documents", kind: "array", required: true, itemSchema: "DocumentSummaryDto" },
    ],
  },
  {
    id: "DeletedResourceResponse",
    dto: "DeletedResourceResponseDto",
    target: "response",
    fields: [
      { name: "id", kind: "string", required: true },
      { name: "deletedAt", kind: "string", required: true, format: "iso-date-time" },
    ],
  },
  {
    id: "DocumentResponse",
    dto: "DocumentResponseDto",
    target: "response",
    fields: [{ name: "document", kind: "object", required: true }],
  },
  {
    id: "ListDocumentsResponse",
    dto: "ListDocumentsResponseDto",
    target: "response",
    fields: [
      { name: "documents", kind: "array", required: true, itemSchema: "DocumentSummaryDto" },
    ],
  },
  {
    id: "ListArchivedDocumentsResponse",
    dto: "ListArchivedDocumentsResponseDto",
    target: "response",
    fields: [
      { name: "documents", kind: "array", required: true, itemSchema: "ArchivedDocumentDto" },
    ],
  },
  {
    id: "DocumentContentResponse",
    dto: "DocumentContentResponseDto",
    target: "response",
    fields: [{ name: "content", kind: "object", required: true }],
  },
  {
    id: "DocumentConnectionsResponse",
    dto: "DocumentConnectionsResponseDto",
    target: "response",
    fields: [
      { name: "documentId", kind: "string", required: true },
      { name: "links", kind: "array", required: true, itemSchema: "DocumentLinkDto" },
      { name: "backlinks", kind: "array", required: true, itemSchema: "BacklinkDto" },
    ],
  },
  {
    id: "ListCheckpointsResponse",
    dto: "ListCheckpointsResponseDto",
    target: "response",
    fields: [{ name: "checkpoints", kind: "array", required: true, itemSchema: "CheckpointDto" }],
  },
  {
    id: "CreateCheckpointResponse",
    dto: "CreateCheckpointResponseDto",
    target: "response",
    fields: [{ name: "checkpoint", kind: "object", required: true }],
  },
  {
    id: "CheckpointSnapshotInspectResponse",
    dto: "CheckpointSnapshotInspectResponseDto",
    target: "response",
    fields: [
      { name: "checkpointId", kind: "string", required: true },
      { name: "documentId", kind: "string", required: true },
      { name: "revisionId", kind: "string", required: true },
      { name: "markdownBody", kind: "string", required: true, format: "markdown" },
      { name: "artifact", kind: "object", required: true },
    ],
  },
  {
    id: "MarkdownExportResponse",
    dto: "MarkdownExportResponseDto",
    target: "response",
    fields: [
      { name: "documentId", kind: "string", required: true },
      { name: "filename", kind: "string", required: true, format: "safe-filename" },
      { name: "contentType", kind: "string", required: true, format: "content-type" },
      { name: "frontmatter", kind: "record", required: true },
      { name: "markdownBody", kind: "string", required: true, format: "markdown" },
      { name: "fileContents", kind: "string", required: true, format: "markdown" },
    ],
  },
  {
    id: "ImageUploadResponse",
    dto: "ImageUploadResponseDto",
    target: "response",
    fields: [{ name: "image", kind: "object", required: true }],
  },
  {
    id: "CollaborationSessionResponse",
    dto: "CollaborationSessionResponseDto",
    target: "response",
    fields: [
      { name: "documentId", kind: "string", required: true },
      { name: "documentKey", kind: "string", required: true },
      { name: "realtimeUrl", kind: "string", required: true },
      { name: "currentMember", kind: "object", required: true },
      { name: "allowedMembers", kind: "array", required: true, itemSchema: "RealtimeMemberDto" },
      { name: "sync", kind: "object", required: true },
    ],
  },
  {
    id: "SeedReviewContextResponse",
    dto: "SeedReviewContextDto",
    target: "response",
    fields: [
      { name: "currentMemberId", kind: "string", required: true },
      { name: "users", kind: "array", required: true, itemSchema: "UserDto" },
      { name: "workspace", kind: "object", required: true },
      { name: "project", kind: "object", required: true },
      { name: "folder", kind: "object", required: true },
      { name: "document", kind: "object", required: true },
      { name: "members", kind: "array", required: true, itemSchema: "WorkspaceMemberDto" },
      { name: "collaboration", kind: "object", required: true },
    ],
  },
] as const satisfies readonly HttpSchemaDescriptor[];
