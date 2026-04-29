export type CollabRuntimeConfig = {
  host: string;
  port: number;
};

export function readCollabRuntimeConfig(env: NodeJS.ProcessEnv): CollabRuntimeConfig {
  return {
    host: readString(env.RME_COLLAB_HOST, "127.0.0.1"),
    port: readPort(env.RME_COLLAB_PORT, 1234),
  };
}

function readString(value: string | undefined, fallback: string): string {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

function readPort(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
