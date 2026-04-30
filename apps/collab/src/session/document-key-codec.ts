export function encodeDocumentKey(documentKey: string): string {
  return Buffer.from(documentKey, "utf8").toString("base64url");
}
