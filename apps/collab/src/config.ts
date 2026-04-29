import { fileURLToPath } from "node:url";

export type LiveYjsPersistenceProvider = "filesystem" | "memory";

export type LiveYjsPersistenceConfig = Readonly<{
  provider: LiveYjsPersistenceProvider;
  directory: string;
}>;

export type CollabRuntimeConfig = {
  host: string;
  port: number;
  publicRealtimeUrl: string;
  seedDocumentKey: string;
  liveYjsPersistence: LiveYjsPersistenceConfig;
};

export function readCollabRuntimeConfig(env: NodeJS.ProcessEnv): CollabRuntimeConfig {
  const host = readString(env.RME_COLLAB_HOST, "127.0.0.1");
  const port = readPort(env.RME_COLLAB_PORT, 1234);
  const liveYjsPersistenceProvider = readLiveYjsPersistenceProvider(
    env.RME_COLLAB_YJS_PERSISTENCE_PROVIDER,
    "filesystem",
  );

  return {
    host,
    port,
    publicRealtimeUrl: readString(env.RME_COLLAB_PUBLIC_URL, `ws://${host}:${port}`),
    seedDocumentKey: readString(
      env.RME_COLLAB_SEED_DOCUMENT_KEY,
      "workspace_review/document_review_plan",
    ),
    liveYjsPersistence: {
      provider: liveYjsPersistenceProvider,
      directory: readString(
        env.RME_COLLAB_YJS_PERSISTENCE_DIR,
        fileURLToPath(new URL("../.data/live-yjs", import.meta.url)),
      ),
    },
  };
}

function readString(value: string | undefined, fallback: string): string {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

function readPort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function readLiveYjsPersistenceProvider(
  value: string | undefined,
  fallback: LiveYjsPersistenceProvider,
): LiveYjsPersistenceProvider {
  const provider = readString(value, fallback);
  if (provider === "filesystem" || provider === "memory") return provider;

  throw new Error(
    `Unsupported RME_COLLAB_YJS_PERSISTENCE_PROVIDER: ${provider}. Expected "filesystem" or "memory".`,
  );
}
