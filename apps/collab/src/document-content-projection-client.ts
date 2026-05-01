export type DocumentContentProjectionClient = Readonly<{
  loadCurrentMarkdown(documentId: string): Promise<string | null>;
  saveCurrentMarkdown(documentId: string, markdownBody: string): Promise<void>;
}>;

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export function createHttpDocumentContentProjectionClient(
  baseUrl: string,
  fetchImpl: FetchLike = fetch,
): DocumentContentProjectionClient {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const contentUrl = (documentId: string) =>
    `${normalizedBaseUrl}/collaboration/internal/documents/${encodeURIComponent(
      documentId,
    )}/content`;

  return {
    async loadCurrentMarkdown(documentId) {
      return loadCurrentMarkdown(fetchImpl, contentUrl(documentId));
    },
    async saveCurrentMarkdown(documentId, markdownBody) {
      await saveCurrentMarkdown(fetchImpl, contentUrl(documentId), markdownBody);
    },
  };
}

async function loadCurrentMarkdown(fetchImpl: FetchLike, url: string): Promise<string | null> {
  const response = await fetchImpl(url);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Document content load failed with ${response.status}.`);

  const body = (await response.json()) as {
    content?: { markdownBody?: unknown };
  };

  return typeof body.content?.markdownBody === "string" ? body.content.markdownBody : null;
}

async function saveCurrentMarkdown(
  fetchImpl: FetchLike,
  url: string,
  markdownBody: string,
): Promise<void> {
  const response = await fetchImpl(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      markdownBody,
    }),
  });
  if (!response.ok) {
    throw new Error(`Document content projection save failed with ${response.status}: ${url}`);
  }
}

export const nullDocumentContentProjectionClient: DocumentContentProjectionClient = {
  async loadCurrentMarkdown() {
    return null;
  },
  async saveCurrentMarkdown() {},
};
