import { createHash } from "node:crypto";

import type { DocumentImageArtifactStorage } from "@/modules/artifacts/ports/document-image-artifact-storage.js";
import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { UploadedDocumentImageDto } from "@rme/contracts";

export type UploadDocumentImageInput = Readonly<{
  documentId: DocumentId;
  filename: string;
  contentType: string;
  altText?: string;
  payload: Uint8Array;
}>;

export type ImageUploadValidationReason = "unsupported_content_type" | "image_too_large";

export class ImageUploadValidationError extends Error {
  constructor(readonly reason: ImageUploadValidationReason) {
    super(messageForReason(reason));
  }
}

export class UploadDocumentImageUseCase {
  static readonly maxImageSizeBytes = 5 * 1024 * 1024;

  constructor(private readonly artifacts: DocumentImageArtifactStorage) {}

  async execute(input: UploadDocumentImageInput): Promise<UploadedDocumentImageDto> {
    validateImage(input);
    const checksumSha256 = createHash("sha256").update(input.payload).digest("hex");
    const stored = await this.artifacts.storeDocumentImage({
      documentId: input.documentId,
      filename: input.filename,
      contentType: normalizedContentType(input.contentType),
      checksumSha256,
      sizeBytes: input.payload.byteLength,
      payload: input.payload,
    });
    const url = `rme-artifact://documents/${encodeURIComponent(
      input.documentId,
    )}/images/${encodeURIComponent(stored.id)}`;
    const altText = input.altText?.trim() || null;

    return {
      documentId: input.documentId,
      filename: input.filename,
      altText,
      artifact: {
        key: stored.id,
        contentType: stored.contentType,
        checksumSha256: stored.checksumSha256,
        sizeBytes: stored.sizeBytes,
      },
      url,
      markdownImage: `![${escapeMarkdownAltText(altText ?? "")}](${url})`,
    };
  }
}

function validateImage(input: UploadDocumentImageInput): void {
  if (!supportedImageContentTypes.has(normalizedContentType(input.contentType))) {
    throw new ImageUploadValidationError("unsupported_content_type");
  }
  if (input.payload.byteLength > UploadDocumentImageUseCase.maxImageSizeBytes) {
    throw new ImageUploadValidationError("image_too_large");
  }
}

const supportedImageContentTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function normalizedContentType(contentType: string): string {
  return contentType.split(";")[0]?.trim().toLowerCase() ?? "";
}

function escapeMarkdownAltText(altText: string): string {
  return altText.replace(/[[\]\\]/g, "\\$&");
}

function messageForReason(reason: ImageUploadValidationReason): string {
  if (reason === "unsupported_content_type") return "Unsupported image content type.";
  return "Image upload exceeds the maximum allowed size.";
}
