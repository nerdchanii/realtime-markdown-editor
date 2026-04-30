import { fileURLToPath } from "node:url";

export type LiveYjsPersistenceProvider = "api-postgres" | "filesystem" | "memory";

export type LiveYjsPersistenceConfig = Readonly<{
  provider: LiveYjsPersistenceProvider;
  directory: string;
}>;

export type CollabRuntimeConfig = {
  host: string;
  port: number;
  apiBaseUrl: string;
  publicRealtimeUrl: string;
  seedDocumentKey: string;
  enableSeedSessionFallback: boolean;
  enableLiveYjsPersistenceFallback: boolean;
  liveYjsPersistence: LiveYjsPersistenceConfig;
};

const BOOLEAN_VALUES = new Map([
  ["1", true],
  ["true", true],
  ["yes", true],
  ["0", false],
  ["false", false],
  ["no", false],
]);

export function readCollabRuntimeConfig(env: NodeJS.ProcessEnv): CollabRuntimeConfig {
  const host = readString(env.RME_COLLAB_HOST, "127.0.0.1");
  const port = readPort(env.RME_COLLAB_PORT, 1234);
  const liveYjsPersistenceProvider = readLiveYjsPersistenceProvider(
    env.RME_COLLAB_YJS_PERSISTENCE_PROVIDER,
    "api-postgres",
  );

  return {
    host,
    port,
    apiBaseUrl: readString(env.RME_API_BASE_URL, "http://127.0.0.1:4000"),
    publicRealtimeUrl: readString(env.RME_COLLAB_PUBLIC_URL, `ws://${host}:${port}`),
    seedDocumentKey: readString(
      env.RME_COLLAB_SEED_DOCUMENT_KEY,
      "workspace_review/document_review_plan",
    ),
    enableSeedSessionFallback: readBoolean(env.RME_COLLAB_ENABLE_SEED_SESSION_FALLBACK, false),
    enableLiveYjsPersistenceFallback: readBoolean(
      env.RME_COLLAB_ENABLE_LIVE_YJS_PERSISTENCE_FALLBACK,
      false,
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

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return fallback;
  return BOOLEAN_VALUES.get(normalized) ?? fallback;
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
  if (provider === "api-postgres" || provider === "filesystem" || provider === "memory") {
    return provider;
  }

  throw new Error(
    `Unsupported RME_COLLAB_YJS_PERSISTENCE_PROVIDER: ${provider}. Expected "api-postgres", "filesystem", or "memory".`,
  );
}
