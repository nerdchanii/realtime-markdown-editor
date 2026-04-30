import { NotFoundException } from "@nestjs/common";

type SeedRouteEnv = Readonly<{
  NODE_ENV?: string;
  RME_API_ENABLE_DEV_SEED_ROUTES?: string;
}>;

export function assertDevSeedRouteEnabled(env: SeedRouteEnv = process.env): void {
  if (isDevSeedRouteEnabled(env)) return;

  throw new NotFoundException("Seed bootstrap routes are available only in development.");
}

export function isDevSeedRouteEnabled(env: SeedRouteEnv = process.env): boolean {
  const configured = env.RME_API_ENABLE_DEV_SEED_ROUTES;
  if (configured !== undefined) {
    return configured === "true" && isLocalDevelopmentEnv(env.NODE_ENV);
  }

  return isLocalDevelopmentEnv(env.NODE_ENV);
}

function isLocalDevelopmentEnv(nodeEnv: string | undefined): boolean {
  return nodeEnv === "development" || nodeEnv === "test";
}
