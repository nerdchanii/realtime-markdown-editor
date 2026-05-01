import {
  ArgumentsHost,
  BadRequestException,
  Body,
  Catch,
  Controller,
  Headers,
  type ExceptionFilter,
  Inject,
  NotFoundException,
  Param,
  PayloadTooLargeException,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { DocumentImageArtifactOwnerNotFoundError } from "@/modules/artifacts/ports/document-image-artifact-storage.js";
import type { DocumentId } from "@/modules/documents/domain/document.js";
import { ProductApiAccessService } from "@/modules/identity/use-cases/product-api-access-service.js";
import {
  type CreateImageUploadRequestBodyDto,
  type CreateImageUploadResponseDto,
  type UploadedImageFileDto,
} from "@/modules/documents/interfaces/image-upload.dto.js";
import {
  ImageUploadValidationError,
  UploadDocumentImageUseCase,
} from "@/modules/documents/use-cases/upload-document-image-use-case.js";
import type { ApiErrorResponseDto, ApiValidationIssueDto } from "@rme/contracts";

type ImageUploadValidationReason =
  | "file_required"
  | "image_too_large"
  | "invalid_altText"
  | ImageUploadValidationError["reason"];

class ImageUploadHttpValidationException extends BadRequestException {
  constructor(
    readonly reason: ImageUploadValidationReason,
    readonly path: readonly string[],
  ) {
    super(reason);
  }
}

type ImageUploadValidationResponse = {
  status(statusCode: number): ImageUploadValidationResponse;
  json(body: ApiErrorResponseDto): void;
};

@Catch(ImageUploadHttpValidationException, PayloadTooLargeException)
class ImageUploadValidationFilter implements ExceptionFilter {
  catch(
    exception: ImageUploadHttpValidationException | PayloadTooLargeException,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse<ImageUploadValidationResponse>();
    const issue = issueForException(exception);

    response.status(400).json({
      code: "validation_failed",
      message: issue.code,
      details: [issue],
    });
  }
}

function issueForException(
  exception: ImageUploadHttpValidationException | PayloadTooLargeException,
): ApiValidationIssueDto {
  if (exception instanceof ImageUploadHttpValidationException) {
    return { path: exception.path, message: exception.reason, code: exception.reason };
  }

  return {
    path: ["multipart", "file"],
    message: "image_too_large",
    code: "image_too_large",
  };
}

@Controller("documents")
export class ImageUploadController {
  constructor(
    @Inject(UploadDocumentImageUseCase)
    private readonly uploadDocumentImage: UploadDocumentImageUseCase,
    @Inject(ProductApiAccessService)
    private readonly access: ProductApiAccessService,
  ) {}

  @Post(":documentId/images")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: UploadDocumentImageUseCase.maxImageSizeBytes },
    }),
  )
  @UseFilters(ImageUploadValidationFilter)
  async uploadImage(
    @Param("documentId") documentId: string,
    @UploadedFile() file: UploadedImageFileDto | undefined,
    @Body() body: CreateImageUploadRequestBodyDto,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<CreateImageUploadResponseDto> {
    await this.access.requireDocumentAccess(cookieHeader, documentId as DocumentId);
    return this.executeUpload(documentId as DocumentId, file, optionalAltText(body.altText));
  }

  private async executeUpload(
    documentId: DocumentId,
    file: UploadedImageFileDto | undefined,
    altText: string | undefined,
  ): Promise<CreateImageUploadResponseDto> {
    if (!file) {
      throw new ImageUploadHttpValidationException("file_required", ["multipart", "file"]);
    }

    try {
      const image = await this.uploadDocumentImage.execute({
        documentId,
        filename: file.originalname,
        contentType: file.mimetype,
        payload: file.buffer,
        ...(altText !== undefined ? { altText } : {}),
      });

      return { image };
    } catch (error) {
      throw mapImageUploadError(error);
    }
  }
}

function mapImageUploadError(error: unknown): Error {
  if (error instanceof ImageUploadValidationError) {
    return new ImageUploadHttpValidationException(error.reason, ["multipart", "file"]);
  }
  if (error instanceof DocumentImageArtifactOwnerNotFoundError) {
    return new NotFoundException("document_not_found");
  }
  return error instanceof Error ? error : new Error("Unknown image upload failure.");
}

function optionalAltText(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  throw new ImageUploadHttpValidationException("invalid_altText", ["multipart", "altText"]);
}
