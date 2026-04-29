import type { CollaborationSession } from "./session-contract.js";

export type CollaborationSessionClient = {
  loadSession(documentKey: string): Promise<CollaborationSession>;
};

export class CollaborationSessionNotFoundError extends Error {
  constructor(documentKey: string) {
    super(`Collaboration session not found for document: ${documentKey}`);
    this.name = "CollaborationSessionNotFoundError";
  }
}
