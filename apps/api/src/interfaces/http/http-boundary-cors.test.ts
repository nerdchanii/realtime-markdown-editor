import "reflect-metadata";

import { strict as assert } from "node:assert";
import type { AddressInfo } from "node:net";
import { test } from "node:test";

import { Controller, Get, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { configureHttpBoundary } from "@/interfaces/http/http-boundary.js";

@Controller("auth")
class AuthController {
  @Get("session")
  session() {
    return { session: null };
  }
}

@Module({ controllers: [AuthController] })
class CorsBoundaryModule {}

test("HTTP boundary allows both local web hostnames in development", async () => {
  await withEnv(
    { NODE_ENV: "development", RME_API_CORS_ORIGIN: "http://127.0.0.1:5173" },
    async () => {
      await withApp(async (baseUrl) => {
        const response = await preflight(baseUrl, "http://localhost:5173");

        assert.equal(response.status, 204);
        assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5173");
        assert.equal(response.headers.get("access-control-allow-credentials"), "true");
      });
    },
  );
});

test("HTTP boundary keeps explicit production CORS origins strict", async () => {
  await withEnv(
    { NODE_ENV: "production", RME_API_CORS_ORIGIN: "http://127.0.0.1:5173" },
    async () => {
      await withApp(async (baseUrl) => {
        const response = await preflight(baseUrl, "http://localhost:5173");

        assert.equal(response.status, 204);
        assert.equal(response.headers.get("access-control-allow-origin"), null);
      });
    },
  );
});

async function withApp(callback: (baseUrl: string) => Promise<void>): Promise<void> {
  const app = await NestFactory.create(CorsBoundaryModule, { logger: ["error"] });
  configureHttpBoundary(app);
  await app.listen(0);

  try {
    await callback(baseUrlForApp(app));
  } finally {
    await app.close();
  }
}

function preflight(baseUrl: string, origin: string): Promise<Response> {
  return fetch(`${baseUrl}/auth/session`, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });
}

function baseUrlForApp(app: Awaited<ReturnType<typeof NestFactory.create>>): string {
  const address = app.getHttpServer().address();
  assertAddressInfo(address);
  return `http://127.0.0.1:${address.port}`;
}

function assertAddressInfo(address: string | AddressInfo | null): asserts address is AddressInfo {
  assert.notEqual(address, null);
  assert.notEqual(typeof address, "string");
}

async function withEnv(
  values: Readonly<Record<string, string>>,
  callback: () => Promise<void>,
): Promise<void> {
  const previous = new Map(Object.keys(values).map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) process.env[key] = value;

  try {
    await callback();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}
