import { strict as assert } from "node:assert";
import { test } from "node:test";

import type {
  StoredDocumentImageArtifact,
  StoreDocumentImageArtifactInput,
  DocumentImageArtifactStorage,
} from "@/modules/artifacts/ports/document-image-artifact-storage.js";
import type { DocumentId } from "@/modules/documents/domain/document.js";

import {
  ImageUploadValidationError,
  UploadDocumentImageUseCase,
} from "./upload-document-image-use-case.js";

test("UploadDocumentImageUseCase stores valid image bytes and returns an editor reference", async () => {
  const storage = new FakeDocumentImageArtifactStorage();
  const useCase = new UploadDocumentImageUseCase(storage);
  const payload = Buffer.from("png bytes");

  const uploaded = await useCase.execute({
    documentId: "document_a" as DocumentId,
    filename: "diagram.png",
    contentType: "image/png",
    altText: "System diagram",
    payload,
  });

  assert.equal(storage.inputs.length, 1);
  assert.equal(storage.inputs[0]?.documentId, "document_a");
  assert.equal(storage.inputs[0]?.contentType, "image/png");
  assert.equal(storage.inputs[0]?.sizeBytes, payload.byteLength);
  assert.equal(storage.inputs[0]?.checksumSha256, uploaded.artifact.checksumSha256);
  assert.deepEqual(Buffer.from(storage.inputs[0]?.payload ?? []), payload);
  assert.deepEqual(uploaded, {
    documentId: "document_a",
    filename: "diagram.png",
    altText: "System diagram",
    artifact: {
      key: "artifact_image_a",
      contentType: "image/png",
      checksumSha256: uploaded.artifact.checksumSha256,
      sizeBytes: payload.byteLength,
    },
    url: "rme-artifact://documents/document_a/images/artifact_image_a",
    markdownImage: "![System diagram](rme-artifact://documents/document_a/images/artifact_image_a)",
  });
  assert.ok(!uploaded.url.includes(storage.stored.storageKey));
  assert.ok(!uploaded.markdownImage.includes(storage.stored.storageKey));
});

test("UploadDocumentImageUseCase rejects unsupported image content types without storing bytes", async () => {
  const storage = new FakeDocumentImageArtifactStorage();
  const useCase = new UploadDocumentImageUseCase(storage);

  await assert.rejects(
    () =>
      useCase.execute({
        documentId: "document_a" as DocumentId,
        filename: "vector.svg",
        contentType: "image/svg+xml",
        payload: Buffer.from("<svg />"),
      }),
    (error) =>
      error instanceof ImageUploadValidationError &&
      error.reason === "unsupported_content_type" &&
      error.message === "Unsupported image content type.",
  );
  assert.equal(storage.inputs.length, 0);
});

test("UploadDocumentImageUseCase rejects oversized images without storing bytes", async () => {
  const storage = new FakeDocumentImageArtifactStorage();
  const useCase = new UploadDocumentImageUseCase(storage);

  await assert.rejects(
    () =>
      useCase.execute({
        documentId: "document_a" as DocumentId,
        filename: "large.png",
        contentType: "image/png",
        payload: Buffer.alloc(UploadDocumentImageUseCase.maxImageSizeBytes + 1),
      }),
    (error) =>
      error instanceof ImageUploadValidationError &&
      error.reason === "image_too_large" &&
      error.message === "Image upload exceeds the maximum allowed size.",
  );
  assert.equal(storage.inputs.length, 0);
});

class FakeDocumentImageArtifactStorage implements DocumentImageArtifactStorage {
  readonly inputs: StoreDocumentImageArtifactInput[] = [];
  readonly stored: StoredDocumentImageArtifact = {
    id: "artifact_image_a",
    documentId: "document_a" as DocumentId,
    workspaceId: "workspace_a" as never,
    storageKey: "local/workspaces/workspace_a/documents/document_a/images/checksum-diagram.png",
    contentType: "image/png",
    checksumSha256: "a".repeat(64),
    sizeBytes: Buffer.byteLength("png bytes"),
  };

  async storeDocumentImage(input: StoreDocumentImageArtifactInput) {
    this.inputs.push(input);
    return {
      ...this.stored,
      contentType: input.contentType,
      checksumSha256: input.checksumSha256,
      sizeBytes: input.sizeBytes,
    };
  }
}
