export type DocumentContentProjectionClient = Readonly<{
  loadCurrentMarkdown(documentId: string): Promise<string | null>;
  saveCurrentMarkdown(documentId: string, markdownBody: string): Promise<void>;
}>;

export function createHttpDocumentContentProjectionClient(
  baseUrl: string,
): DocumentContentProjectionClient {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const contentUrl = (documentId: string) =>
    `${normalizedBaseUrl}/documents/${encodeURIComponent(documentId)}/content`;

  return {
    async loadCurrentMarkdown(documentId) {
      return loadCurrentMarkdown(contentUrl(documentId));
    },
    async saveCurrentMarkdown(documentId, markdownBody) {
      await saveCurrentMarkdown(contentUrl(documentId), markdownBody);
    },
  };
}

async function loadCurrentMarkdown(url: string): Promise<string | null> {
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Document content load failed with ${response.status}.`);

  const body = (await response.json()) as {
    content?: { markdownBody?: unknown };
  };

  return typeof body.content?.markdownBody === "string" ? body.content.markdownBody : null;
}

async function saveCurrentMarkdown(url: string, markdownBody: string): Promise<void> {
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      markdownBody,
      source: "collaboration-projection",
    }),
  });
  if (!response.ok) {
    throw new Error(`Document content projection save failed with ${response.status}.`);
  }
}

export const nullDocumentContentProjectionClient: DocumentContentProjectionClient = {
  async loadCurrentMarkdown() {
    return null;
  },
  async saveCurrentMarkdown() {},
};
