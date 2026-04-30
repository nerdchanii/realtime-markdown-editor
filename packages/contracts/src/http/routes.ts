/* eslint-disable max-lines */

import type { HttpSchemaRef } from "./schemas.js";

export type HttpMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export type HttpRouteOwner =
  | "CollaborationModule"
  | "DocumentsModule"
  | "IdentityModule"
  | "ReviewContextModule"
  | "WorkspaceModule";

export type HttpRouteAudience = "product" | "dev-only" | "retired";

export type SubjectRequirementRef =
  | "CE-01"
  | "CE-02"
  | "CE-03"
  | "CE-04"
  | "CE-05"
  | "REQ-EDITOR-RICH-AUTHORING-SURFACE"
  | "REQ-HISTORY-CHECKPOINTS"
  | "REQ-IDENTITY-MEMBERSHIP"
  | "REQ-LINKS-BACKLINKS-STANDARD-MARKDOWN"
  | "REQ-MARKDOWN-EXPORT-FRONTMATTER"
  | "REQ-MARKDOWN-PORTABILITY"
  | "REQ-OFFLINE-RECONNECT-MERGE"
  | "REQ-PRESENCE-MEMBER-AWARENESS"
  | "REQ-PROPERTIES-OUTSIDE-BODY"
  | "REQ-WORKSPACE-DOCUMENT-SCOPE"
  | "REQ-WORKSPACE-HIERARCHY";

export type HttpRouteSchemaSet = Readonly<{
  params?: HttpSchemaRef;
  query?: HttpSchemaRef;
  body?: HttpSchemaRef;
  multipart?: HttpSchemaRef;
  response?: HttpSchemaRef;
}>;

export type HttpRouteContract = Readonly<{
  id: string;
  method: HttpMethod;
  path: string;
  owner: HttpRouteOwner;
  audience: HttpRouteAudience;
  requestDto?: string;
  responseDto: string;
  schemas: HttpRouteSchemaSet;
  relatedRequirements: readonly SubjectRequirementRef[];
  notes?: readonly string[];
  replaces?: string;
}>;

export const canonicalCheckpointCreationRoute = {
  method: "POST",
  path: "/documents/:documentId/checkpoints",
} as const;

export const canonicalProductHttpRoutes = [
  {
    id: "auth.createSession",
    method: "POST",
    path: "/auth/session",
    owner: "IdentityModule",
    audience: "product",
    requestDto: "CreateSessionRequestDto",
    responseDto: "SessionResponseDto",
    schemas: { body: "CreateSessionRequest", response: "SessionResponse" },
    relatedRequirements: ["REQ-IDENTITY-MEMBERSHIP", "REQ-PRESENCE-MEMBER-AWARENESS"],
  },
  {
    id: "auth.getSession",
    method: "GET",
    path: "/auth/session",
    owner: "IdentityModule",
    audience: "product",
    responseDto: "SessionResponseDto",
    schemas: { response: "SessionResponse" },
    relatedRequirements: ["REQ-IDENTITY-MEMBERSHIP", "REQ-PRESENCE-MEMBER-AWARENESS"],
  },
  {
    id: "auth.deleteSession",
    method: "DELETE",
    path: "/auth/session",
    owner: "IdentityModule",
    audience: "product",
    responseDto: "EmptyResponseDto",
    schemas: { response: "EmptyResponse" },
    relatedRequirements: ["REQ-IDENTITY-MEMBERSHIP"],
  },
  {
    id: "workspaces.list",
    method: "GET",
    path: "/workspaces",
    owner: "WorkspaceModule",
    audience: "product",
    responseDto: "ListWorkspacesResponseDto",
    schemas: { response: "ListWorkspacesResponse" },
    relatedRequirements: ["REQ-WORKSPACE-HIERARCHY", "REQ-WORKSPACE-DOCUMENT-SCOPE"],
  },
  {
    id: "workspaces.create",
    method: "POST",
    path: "/workspaces",
    owner: "WorkspaceModule",
    audience: "product",
    requestDto: "CreateWorkspaceRequestDto",
    responseDto: "WorkspaceResponseDto",
    schemas: { body: "CreateWorkspaceRequest", response: "WorkspaceResponse" },
    relatedRequirements: ["REQ-WORKSPACE-HIERARCHY"],
  },
  {
    id: "workspaces.get",
    method: "GET",
    path: "/workspaces/:workspaceId",
    owner: "WorkspaceModule",
    audience: "product",
    responseDto: "WorkspaceResponseDto",
    schemas: { params: "WorkspaceIdPathParams", response: "WorkspaceResponse" },
    relatedRequirements: ["REQ-WORKSPACE-HIERARCHY", "REQ-WORKSPACE-DOCUMENT-SCOPE"],
  },
  {
    id: "workspaces.update",
    method: "PATCH",
    path: "/workspaces/:workspaceId",
    owner: "WorkspaceModule",
    audience: "product",
    requestDto: "UpdateWorkspaceRequestDto",
    responseDto: "WorkspaceResponseDto",
    schemas: {
      params: "WorkspaceIdPathParams",
      body: "UpdateWorkspaceRequest",
      response: "WorkspaceResponse",
    },
    relatedRequirements: ["REQ-WORKSPACE-HIERARCHY"],
  },
  {
    id: "workspaces.getNavigation",
    method: "GET",
    path: "/workspaces/:workspaceId/navigation",
    owner: "WorkspaceModule",
    audience: "product",
    responseDto: "WorkspaceNavigationResponseDto",
    schemas: { params: "WorkspaceIdPathParams", response: "WorkspaceNavigationResponse" },
    relatedRequirements: ["REQ-WORKSPACE-HIERARCHY", "REQ-WORKSPACE-DOCUMENT-SCOPE"],
  },
  {
    id: "projects.list",
    method: "GET",
    path: "/workspaces/:workspaceId/projects",
    owner: "WorkspaceModule",
    audience: "product",
    responseDto: "ListProjectsResponseDto",
    schemas: { params: "WorkspaceIdPathParams", response: "ListProjectsResponse" },
    relatedRequirements: ["REQ-WORKSPACE-HIERARCHY"],
  },
  {
    id: "projects.create",
    method: "POST",
    path: "/workspaces/:workspaceId/projects",
    owner: "WorkspaceModule",
    audience: "product",
    requestDto: "CreateProjectRequestDto",
    responseDto: "ProjectResponseDto",
    schemas: {
      params: "WorkspaceIdPathParams",
      body: "CreateProjectRequest",
      response: "ProjectResponse",
    },
    relatedRequirements: ["REQ-WORKSPACE-HIERARCHY"],
  },
  {
    id: "projects.get",
    method: "GET",
    path: "/projects/:projectId",
    owner: "WorkspaceModule",
    audience: "product",
    responseDto: "ProjectResponseDto",
    schemas: { params: "ProjectIdPathParams", response: "ProjectResponse" },
    relatedRequirements: ["REQ-WORKSPACE-HIERARCHY"],
  },
  {
    id: "projects.update",
    method: "PATCH",
    path: "/projects/:projectId",
    owner: "WorkspaceModule",
    audience: "product",
    requestDto: "UpdateProjectRequestDto",
    responseDto: "ProjectResponseDto",
    schemas: {
      params: "ProjectIdPathParams",
      body: "UpdateProjectRequest",
      response: "ProjectResponse",
    },
    relatedRequirements: ["REQ-WORKSPACE-HIERARCHY"],
  },
  {
    id: "folders.listChildren",
    method: "GET",
    path: "/folders/:folderId/children",
    owner: "WorkspaceModule",
    audience: "product",
    responseDto: "FolderChildrenResponseDto",
    schemas: { params: "FolderIdPathParams", response: "FolderChildrenResponse" },
    relatedRequirements: ["REQ-WORKSPACE-HIERARCHY", "REQ-WORKSPACE-DOCUMENT-SCOPE"],
  },
  {
    id: "folders.create",
    method: "POST",
    path: "/folders",
    owner: "WorkspaceModule",
    audience: "product",
    requestDto: "CreateFolderRequestDto",
    responseDto: "FolderResponseDto",
    schemas: { body: "CreateFolderRequest", response: "FolderResponse" },
    relatedRequirements: ["REQ-WORKSPACE-HIERARCHY"],
  },
  {
    id: "folders.update",
    method: "PATCH",
    path: "/folders/:folderId",
    owner: "WorkspaceModule",
    audience: "product",
    requestDto: "UpdateFolderRequestDto",
    responseDto: "FolderResponseDto",
    schemas: {
      params: "FolderIdPathParams",
      body: "UpdateFolderRequest",
      response: "FolderResponse",
    },
    relatedRequirements: ["REQ-WORKSPACE-HIERARCHY"],
  },
  {
    id: "folders.move",
    method: "POST",
    path: "/folders/:folderId/move",
    owner: "WorkspaceModule",
    audience: "product",
    requestDto: "MoveFolderRequestDto",
    responseDto: "FolderResponseDto",
    schemas: {
      params: "FolderIdPathParams",
      body: "MoveFolderRequest",
      response: "FolderResponse",
    },
    relatedRequirements: ["REQ-WORKSPACE-HIERARCHY"],
  },
  {
    id: "folders.delete",
    method: "DELETE",
    path: "/folders/:folderId",
    owner: "WorkspaceModule",
    audience: "product",
    responseDto: "DeletedResourceResponseDto",
    schemas: { params: "FolderIdPathParams", response: "DeletedResourceResponse" },
    relatedRequirements: ["REQ-WORKSPACE-HIERARCHY"],
    notes: ["Root folders must reject delete requests."],
  },
  {
    id: "documents.listByFolder",
    method: "GET",
    path: "/folders/:folderId/documents",
    owner: "DocumentsModule",
    audience: "product",
    responseDto: "ListDocumentsResponseDto",
    schemas: { params: "FolderIdPathParams", response: "ListDocumentsResponse" },
    relatedRequirements: ["CE-01", "REQ-WORKSPACE-DOCUMENT-SCOPE"],
  },
  {
    id: "documents.create",
    method: "POST",
    path: "/folders/:folderId/documents",
    owner: "DocumentsModule",
    audience: "product",
    requestDto: "CreateDocumentRequestDto",
    responseDto: "DocumentResponseDto",
    schemas: {
      params: "FolderIdPathParams",
      body: "CreateDocumentRequest",
      response: "DocumentResponse",
    },
    relatedRequirements: [
      "CE-01",
      "CE-05",
      "REQ-PROPERTIES-OUTSIDE-BODY",
      "REQ-WORKSPACE-DOCUMENT-SCOPE",
    ],
  },
  {
    id: "documents.get",
    method: "GET",
    path: "/documents/:documentId",
    owner: "DocumentsModule",
    audience: "product",
    responseDto: "DocumentResponseDto",
    schemas: { params: "DocumentIdPathParams", response: "DocumentResponse" },
    relatedRequirements: ["CE-01", "CE-05", "REQ-WORKSPACE-DOCUMENT-SCOPE"],
  },
  {
    id: "documents.update",
    method: "PATCH",
    path: "/documents/:documentId",
    owner: "DocumentsModule",
    audience: "product",
    requestDto: "UpdateDocumentRequestDto",
    responseDto: "DocumentResponseDto",
    schemas: {
      params: "DocumentIdPathParams",
      body: "UpdateDocumentRequest",
      response: "DocumentResponse",
    },
    relatedRequirements: ["REQ-PROPERTIES-OUTSIDE-BODY"],
  },
  {
    id: "documents.move",
    method: "POST",
    path: "/documents/:documentId/move",
    owner: "DocumentsModule",
    audience: "product",
    requestDto: "MoveDocumentRequestDto",
    responseDto: "DocumentResponseDto",
    schemas: {
      params: "DocumentIdPathParams",
      body: "MoveDocumentRequest",
      response: "DocumentResponse",
    },
    relatedRequirements: ["REQ-WORKSPACE-HIERARCHY", "REQ-WORKSPACE-DOCUMENT-SCOPE"],
  },
  {
    id: "documents.delete",
    method: "DELETE",
    path: "/documents/:documentId",
    owner: "DocumentsModule",
    audience: "product",
    responseDto: "DeletedResourceResponseDto",
    schemas: { params: "DocumentIdPathParams", response: "DeletedResourceResponse" },
    relatedRequirements: ["REQ-WORKSPACE-HIERARCHY"],
  },
  {
    id: "documents.getContent",
    method: "GET",
    path: "/documents/:documentId/content",
    owner: "DocumentsModule",
    audience: "product",
    responseDto: "DocumentContentResponseDto",
    schemas: { params: "DocumentIdPathParams", response: "DocumentContentResponse" },
    relatedRequirements: [
      "CE-01",
      "CE-03",
      "CE-05",
      "REQ-EDITOR-RICH-AUTHORING-SURFACE",
      "REQ-MARKDOWN-PORTABILITY",
    ],
  },
  {
    id: "documents.updateContentProjection",
    method: "PUT",
    path: "/documents/:documentId/content",
    owner: "DocumentsModule",
    audience: "product",
    requestDto: "UpdateDocumentContentRequestDto",
    responseDto: "DocumentContentResponseDto",
    schemas: {
      params: "DocumentIdPathParams",
      body: "UpdateDocumentContentRequest",
      response: "DocumentContentResponse",
    },
    relatedRequirements: ["CE-03", "CE-05", "REQ-MARKDOWN-PORTABILITY"],
  },
  {
    id: "documents.replaceProperties",
    method: "PUT",
    path: "/documents/:documentId/properties",
    owner: "DocumentsModule",
    audience: "product",
    requestDto: "ReplaceDocumentPropertiesRequestDto",
    responseDto: "DocumentResponseDto",
    schemas: {
      params: "DocumentIdPathParams",
      body: "ReplaceDocumentPropertiesRequest",
      response: "DocumentResponse",
    },
    relatedRequirements: ["REQ-PROPERTIES-OUTSIDE-BODY"],
  },
  {
    id: "documents.getConnections",
    method: "GET",
    path: "/documents/:documentId/connections",
    owner: "DocumentsModule",
    audience: "product",
    responseDto: "DocumentConnectionsResponseDto",
    schemas: { params: "DocumentIdPathParams", response: "DocumentConnectionsResponse" },
    relatedRequirements: ["REQ-LINKS-BACKLINKS-STANDARD-MARKDOWN"],
  },
  {
    id: "documents.listCheckpoints",
    method: "GET",
    path: "/documents/:documentId/checkpoints",
    owner: "DocumentsModule",
    audience: "product",
    responseDto: "ListCheckpointsResponseDto",
    schemas: { params: "DocumentIdPathParams", response: "ListCheckpointsResponse" },
    relatedRequirements: ["CE-04", "REQ-HISTORY-CHECKPOINTS"],
  },
  {
    id: "documents.createCheckpoint",
    method: "POST",
    path: "/documents/:documentId/checkpoints",
    owner: "DocumentsModule",
    audience: "product",
    requestDto: "CreateCheckpointRequestDto",
    responseDto: "CreateCheckpointResponseDto",
    schemas: {
      params: "DocumentIdPathParams",
      body: "CreateCheckpointRequest",
      response: "CreateCheckpointResponse",
    },
    relatedRequirements: ["CE-04", "REQ-HISTORY-CHECKPOINTS", "REQ-MARKDOWN-PORTABILITY"],
    notes: [
      "This is the canonical checkpoint creation route.",
      "Collaboration routes do not own checkpoint creation.",
      "The server resolves the author membership and current Markdown snapshot.",
    ],
  },
  {
    id: "documents.inspectCheckpointSnapshot",
    method: "GET",
    path: "/documents/checkpoints/:checkpointId/snapshot",
    owner: "DocumentsModule",
    audience: "product",
    responseDto: "CheckpointSnapshotInspectResponseDto",
    schemas: { params: "CheckpointIdPathParams", response: "CheckpointSnapshotInspectResponse" },
    relatedRequirements: ["CE-04", "REQ-HISTORY-CHECKPOINTS"],
  },
  {
    id: "documents.createMarkdownExport",
    method: "POST",
    path: "/documents/:documentId/export",
    owner: "DocumentsModule",
    audience: "product",
    requestDto: "CreateMarkdownExportRequestDto",
    responseDto: "MarkdownExportResponseDto",
    schemas: {
      params: "DocumentIdPathParams",
      body: "CreateMarkdownExportRequest",
      response: "MarkdownExportResponse",
    },
    relatedRequirements: ["CE-05", "REQ-MARKDOWN-EXPORT-FRONTMATTER", "REQ-MARKDOWN-PORTABILITY"],
    notes: ["The server resolves current Markdown body and properties for export."],
  },
  {
    id: "documents.createImageUpload",
    method: "POST",
    path: "/documents/:documentId/images",
    owner: "DocumentsModule",
    audience: "product",
    requestDto: "CreateImageUploadRequestDto",
    responseDto: "ImageUploadResponseDto",
    schemas: {
      params: "DocumentIdPathParams",
      multipart: "CreateImageUploadRequest",
      response: "ImageUploadResponse",
    },
    relatedRequirements: ["CE-05", "REQ-EDITOR-RICH-AUTHORING-SURFACE"],
    notes: ["Response exposes an editor-insertable reference, not provider storage internals."],
  },
  {
    id: "documents.createCollaborationSession",
    method: "POST",
    path: "/documents/:documentId/collaboration-sessions",
    owner: "CollaborationModule",
    audience: "product",
    requestDto: "CreateCollaborationSessionRequestDto",
    responseDto: "CollaborationSessionResponseDto",
    schemas: {
      params: "DocumentIdPathParams",
      body: "CreateCollaborationSessionRequest",
      response: "CollaborationSessionResponse",
    },
    relatedRequirements: [
      "CE-01",
      "CE-02",
      "CE-03",
      "REQ-OFFLINE-RECONNECT-MERGE",
      "REQ-PRESENCE-MEMBER-AWARENESS",
    ],
    notes: [
      "The route issues provider-neutral session data for the collab runtime.",
      "It must not create checkpoints or expose provider-specific Yjs/Hocuspocus state.",
    ],
  },
] as const satisfies readonly HttpRouteContract[];

export const devOnlyHttpRoutes = [
  {
    id: "dev.getSeedReviewContext",
    method: "GET",
    path: "/review-context/seed",
    owner: "ReviewContextModule",
    audience: "dev-only",
    responseDto: "SeedReviewContextDto",
    schemas: { response: "SeedReviewContextResponse" },
    relatedRequirements: ["CE-01", "CE-02", "CE-03", "CE-04", "CE-05"],
    notes: ["Local reviewer bootstrap only; not a normal product runtime dependency."],
  },
  {
    id: "dev.getSeedCollaborationSession",
    method: "GET",
    path: "/collaboration/sessions/seed",
    owner: "CollaborationModule",
    audience: "dev-only",
    responseDto: "CollaborationSessionResponseDto",
    schemas: { query: "CollaborationSessionQuery", response: "CollaborationSessionResponse" },
    relatedRequirements: ["CE-01", "CE-02", "CE-03"],
    notes: ["Local reviewer bootstrap only; replaced by document collaboration sessions."],
  },
] as const satisfies readonly HttpRouteContract[];

export const retiredHttpRoutes = [
  {
    id: "retired.collaborationGetDocumentSession",
    method: "GET",
    path: "/collaboration/documents/:documentId/session",
    owner: "CollaborationModule",
    audience: "retired",
    responseDto: "CollaborationSessionResponseDto",
    schemas: {
      params: "DocumentIdPathParams",
      query: "CollaborationSessionQuery",
      response: "CollaborationSessionResponse",
    },
    relatedRequirements: ["CE-01", "CE-02", "CE-03"],
    replaces: "POST /documents/:documentId/collaboration-sessions",
    notes: [
      "Existing seed-backed route; product runtime should use the canonical documents route.",
    ],
  },
] as const satisfies readonly HttpRouteContract[];

export const httpRouteInventory = [
  ...canonicalProductHttpRoutes,
  ...devOnlyHttpRoutes,
  ...retiredHttpRoutes,
] as const satisfies readonly HttpRouteContract[];
