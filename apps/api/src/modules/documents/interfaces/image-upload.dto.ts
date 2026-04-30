import type { ImageUploadResponseDto } from "@rme/contracts";

export type CreateImageUploadRequestBodyDto = Readonly<{
  altText?: unknown;
}>;

export type UploadedImageFileDto = Readonly<{
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}>;

export type CreateImageUploadResponseDto = ImageUploadResponseDto;
