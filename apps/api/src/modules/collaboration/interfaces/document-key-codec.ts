export function decodeDocumentKey(encodedDocumentKey: string): string {
  return Buffer.from(encodedDocumentKey, "base64url").toString("utf8");
}
