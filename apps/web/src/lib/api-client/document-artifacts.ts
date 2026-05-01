import type {
  CheckpointId,
  CheckpointSnapshotInspectDto,
  CreateMarkdownExportRequestDto,
  ImageUploadResponseDto,
  MarkdownExportResponseDto,
  UploadedDocumentImageDto,
} from "@rme/contracts";

import type { ApiClient } from "./index";

export async function inspectCheckpointSnapshot(
  client: ApiClient,
  checkpointId: CheckpointId,
): Promise<CheckpointSnapshotInspectDto> {
  const response = await fetch(
    `${client.baseUrl}/documents/checkpoints/${encodeURIComponent(checkpointId)}/snapshot`,
    { credentials: "include" },
  );

  if (!response.ok) {
    throw new Error(`Checkpoint inspect request failed with ${response.status}`);
  }

  return (await response.json()) as CheckpointSnapshotInspectDto;
}

export async function createMarkdownExport(
  client: ApiClient,
  documentId: string,
  request: CreateMarkdownExportRequestDto,
): Promise<MarkdownExportResponseDto> {
  const body = new URLSearchParams();
  if (request.filename !== undefined) body.set("filename", request.filename);

  const response = await fetch(
    `${client.baseUrl}/documents/${encodeURIComponent(documentId)}/export`,
    {
      method: "POST",
      credentials: "include",
      body,
    },
  );

  if (!response.ok) {
    throw new Error(`Markdown export request failed with ${response.status}`);
  }

  return (await response.json()) as MarkdownExportResponseDto;
}

export async function uploadDocumentImage(
  client: ApiClient,
  documentId: string,
  request: Readonly<{ file: File; altText?: string | undefined }>,
): Promise<UploadedDocumentImageDto> {
  const body = new FormData();
  body.set("file", request.file);
  if (request.altText !== undefined) body.set("altText", request.altText);

  const response = await fetch(
    `${client.baseUrl}/documents/${encodeURIComponent(documentId)}/images`,
    {
      method: "POST",
      credentials: "include",
      body,
    },
  );

  if (!response.ok) {
    throw new Error(`Image upload request failed with ${response.status}`);
  }

  const payload = (await response.json()) as ImageUploadResponseDto;
  return payload.image;
}
