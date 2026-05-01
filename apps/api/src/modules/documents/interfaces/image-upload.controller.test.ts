import { strict as assert } from "node:assert";
import type { AddressInfo } from "node:net";
import { test } from "node:test";

import { BadRequestException, NotFoundException } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "@/app.module.js";
import { configureHttpBoundary } from "@/interfaces/http/http-boundary.js";
import { DocumentImageArtifactOwnerNotFoundError } from "@/modules/artifacts/ports/document-image-artifact-storage.js";
import { ImageUploadController } from "@/modules/documents/interfaces/image-upload.controller.js";
import { ProductApiAccessService } from "@/modules/identity/use-cases/product-api-access-service.js";
import type { UploadDocumentImageInput } from "@/modules/documents/use-cases/upload-document-image-use-case.js";
import {
  ImageUploadValidationError,
  UploadDocumentImageUseCase,
} from "@/modules/documents/use-cases/upload-document-image-use-case.js";
import type { ApiErrorResponseDto } from "@rme/contracts";

test("ImageUploadController forwards multipart file bytes to the upload use case", async () => {
  const useCase = new FakeUploadDocumentImageUseCase();
  const controller = createController(useCase);
  const payload = Buffer.from("image bytes");

  const response = await controller.uploadImage(
    "document_a",
    {
      originalname: "diagram.png",
      mimetype: "image/png",
      buffer: payload,
      size: payload.byteLength,
    },
    { altText: "Diagram" },
    undefined,
  );

  assert.equal(useCase.inputs.length, 1);
  assert.deepEqual(useCase.inputs[0], {
    documentId: "document_a",
    filename: "diagram.png",
    contentType: "image/png",
    altText: "Diagram",
    payload,
  });
  assert.equal(
    response.image.markdownImage,
    "![Diagram](rme-artifact://documents/document_a/images/artifact_image_a)",
  );
});

test("ImageUploadController rejects missing image files", async () => {
  const useCase = new FakeUploadDocumentImageUseCase();
  const controller = createController(useCase);

  await assert.rejects(
    () => controller.uploadImage("document_a", undefined, {}, undefined),
    (error) => error instanceof BadRequestException && error.message === "file_required",
  );
  assert.equal(useCase.inputs.length, 0);
});

test("ImageUploadController rejects malformed multipart alt text", async () => {
  const useCase = new FakeUploadDocumentImageUseCase();
  const controller = createController(useCase);

  await assert.rejects(
    () =>
      controller.uploadImage(
        "document_a",
        {
          originalname: "diagram.png",
          mimetype: "image/png",
          buffer: Buffer.from("png bytes"),
          size: Buffer.byteLength("png bytes"),
        },
        { altText: ["Diagram"] },
        undefined,
      ),
    (error) => error instanceof BadRequestException && error.message === "invalid_altText",
  );
  assert.equal(useCase.inputs.length, 0);
});

test("ImageUploadController maps image validation failures to bad requests", async () => {
  const useCase = new FakeUploadDocumentImageUseCase("unsupported_content_type");
  const controller = createController(useCase);

  await assert.rejects(
    () =>
      controller.uploadImage(
        "document_a",
        {
          originalname: "diagram.svg",
          mimetype: "image/svg+xml",
          buffer: Buffer.from("<svg />"),
          size: Buffer.byteLength("<svg />"),
        },
        {},
        undefined,
      ),
    (error) => error instanceof BadRequestException && error.message === "unsupported_content_type",
  );
});

test("ImageUploadController maps missing document artifacts to not found", async () => {
  const useCase = new FakeUploadDocumentImageUseCase(undefined, true);
  const controller = createController(useCase);

  await assert.rejects(
    () =>
      controller.uploadImage(
        "document_missing",
        {
          originalname: "diagram.png",
          mimetype: "image/png",
          buffer: Buffer.from("png bytes"),
          size: Buffer.byteLength("png bytes"),
        },
        {},
        undefined,
      ),
    (error) => error instanceof NotFoundException && error.message === "document_not_found",
  );
});

test("image upload HTTP route returns a stable oversized upload validation envelope", async () => {
  const app = await NestFactory.create(AppModule, { logger: ["error"] });
  configureHttpBoundary(app);
  await app.listen(0);

  try {
    const formData = new FormData();
    formData.set(
      "file",
      new Blob([Buffer.alloc(UploadDocumentImageUseCase.maxImageSizeBytes + 1)], {
        type: "image/png",
      }),
      "large.png",
    );

    const response = await fetch(`${baseUrlForApp(app)}/documents/document_a/images`, {
      method: "POST",
      body: formData,
    });
    const body = (await response.json()) as ApiErrorResponseDto;

    assert.equal(response.status, 400);
    assert.equal(body.code, "validation_failed");
    assert.equal(body.message, "image_too_large");
    assert.deepEqual(body.details?.[0], {
      path: ["multipart", "file"],
      message: "image_too_large",
      code: "image_too_large",
    });
  } finally {
    await app.close();
  }
});

class FakeUploadDocumentImageUseCase {
  readonly inputs: UploadDocumentImageInput[] = [];

  constructor(
    private readonly failure?: ConstructorParameters<typeof ImageUploadValidationError>[0],
    private readonly ownerMissing = false,
  ) {}

  async execute(input: UploadDocumentImageInput) {
    this.inputs.push(input);
    if (this.ownerMissing) throw new DocumentImageArtifactOwnerNotFoundError(input.documentId);
    if (this.failure) throw new ImageUploadValidationError(this.failure);

    return {
      documentId: input.documentId,
      filename: input.filename,
      altText: input.altText ?? null,
      artifact: {
        key: "artifact_image_a",
        contentType: input.contentType,
        checksumSha256: "a".repeat(64),
        sizeBytes: input.payload.byteLength,
      },
      url: `rme-artifact://documents/${input.documentId}/images/artifact_image_a`,
      markdownImage: `![${
        input.altText ?? ""
      }](rme-artifact://documents/${input.documentId}/images/artifact_image_a)`,
    };
  }
}

class FakeProductApiAccessService {
  async requireDocumentAccess(): Promise<void> {}
}

function createController(useCase: FakeUploadDocumentImageUseCase): ImageUploadController {
  return new ImageUploadController(
    useCase as unknown as UploadDocumentImageUseCase,
    new FakeProductApiAccessService() as unknown as ProductApiAccessService,
  );
}

function assertAddressInfo(address: string | AddressInfo | null): asserts address is AddressInfo {
  assert.notEqual(address, null);
  assert.notEqual(typeof address, "string");
}

function baseUrlForApp(app: Awaited<ReturnType<typeof NestFactory.create>>): string {
  const address = app.getHttpServer().address();
  assertAddressInfo(address);
  return `http://127.0.0.1:${address.port}`;
}
