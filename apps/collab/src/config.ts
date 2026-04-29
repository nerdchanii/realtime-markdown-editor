export type CollabRuntimeConfig = {
  host: string;
  port: number;
  publicRealtimeUrl: string;
  seedDocumentKey: string;
};

export function readCollabRuntimeConfig(env: NodeJS.ProcessEnv): CollabRuntimeConfig {
  const host = readString(env.RME_COLLAB_HOST, "127.0.0.1");
  const port = readPort(env.RME_COLLAB_PORT, 1234);

  return {
    host,
    port,
    publicRealtimeUrl: readString(env.RME_COLLAB_PUBLIC_URL, `ws://${host}:${port}`),
    seedDocumentKey: readString(
      env.RME_COLLAB_SEED_DOCUMENT_KEY,
      "workspace_review/document_review_plan",
    ),
  };
}

function readString(value: string | undefined, fallback: string): string {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

function readPort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
