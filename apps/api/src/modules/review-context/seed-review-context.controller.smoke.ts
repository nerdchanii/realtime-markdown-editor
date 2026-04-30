import "reflect-metadata";

import { strict as assert } from "node:assert";
import type { AddressInfo } from "node:net";
import { test } from "node:test";

import { NestFactory } from "@nestjs/core";
import type { SeedReviewContextDto } from "@rme/contracts";

import { AppModule } from "@/app.module.js";
import { configureHttpBoundary } from "@/interfaces/http/http-boundary.js";

test("GET /review-context/seed returns the seeded review context", async () => {
  await withDevSeedRoutesEnabled(async () => {
    const app = await NestFactory.create(AppModule, { logger: ["error"] });
    configureHttpBoundary(app);
    await app.listen(0);

    try {
      const address = app.getHttpServer().address();
      assertAddressInfo(address);

      const response = await fetch(`http://127.0.0.1:${address.port}/review-context/seed`);
      const responseText = await response.text();
      assert.equal(response.status, 200, responseText);

      assertSeedReviewContext(JSON.parse(responseText) as SeedReviewContextDto);
    } finally {
      await app.close();
    }
  });
});

function assertAddressInfo(address: string | AddressInfo | null): asserts address is AddressInfo {
  assert.notEqual(address, null);
  assert.notEqual(typeof address, "string");
}

function assertSeedReviewContext(body: SeedReviewContextDto) {
  assert.equal(body.workspace.name, "Review Workspace");
  assert.equal(body.project.name, "Launch Readiness");
  assert.ok(body.folders.some((folder) => folder.kind === "projectRoot"));
  assert.match(body.document.markdownBody, /Review Plan/);
  assert.equal(body.collaboration.documentKey, "workspace_review/document_review_plan");
  assert.equal(body.checkpoints[0]?.snapshotArtifact.contentType, "text/markdown; charset=utf-8");
}

async function withDevSeedRoutesEnabled(callback: () => Promise<void>) {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousSeedRoutes = process.env.RME_API_ENABLE_DEV_SEED_ROUTES;
  process.env.NODE_ENV = "test";
  process.env.RME_API_ENABLE_DEV_SEED_ROUTES = "true";

  try {
    await callback();
  } finally {
    restoreEnv("NODE_ENV", previousNodeEnv);
    restoreEnv("RME_API_ENABLE_DEV_SEED_ROUTES", previousSeedRoutes);
  }
}

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
