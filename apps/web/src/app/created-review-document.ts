import type { SeedReviewContextDto } from "@rme/contracts";

export type CreatedReviewDocument = Readonly<{
  id: string;
  title: string;
  folderId: string;
  projectId: string | null;
  markdownBody: string;
}>;

export type ReviewDocument = SeedReviewContextDto["documents"][number] | CreatedReviewDocument;

export function isSeedDocument(
  document: ReviewDocument,
): document is SeedReviewContextDto["documents"][number] {
  return "properties" in document;
}
