import * as Y from "yjs";

export type YjsDocumentStore = {
  loadDocument(documentKey: string, document: Y.Doc): Promise<void>;
  storeDocument(documentKey: string, document: Y.Doc): Promise<void>;
};

export type SeededYjsDocument = Readonly<{
  documentKey: string;
  markdown: string;
}>;

export class InMemorySeededYjsDocumentStore implements YjsDocumentStore {
  private readonly snapshots = new Map<string, Uint8Array>();

  constructor(private readonly seed: SeededYjsDocument) {}

  async loadDocument(documentKey: string, document: Y.Doc): Promise<void> {
    const snapshot = this.snapshots.get(documentKey);
    if (snapshot) {
      Y.applyUpdate(document, snapshot);
      return;
    }

    if (documentKey !== this.seed.documentKey) return;

    const markdown = document.getText("markdown");
    if (markdown.length === 0) markdown.insert(0, this.seed.markdown);
    await this.storeDocument(documentKey, document);
  }

  async storeDocument(documentKey: string, document: Y.Doc): Promise<void> {
    this.snapshots.set(documentKey, Y.encodeStateAsUpdate(document));
  }
}
