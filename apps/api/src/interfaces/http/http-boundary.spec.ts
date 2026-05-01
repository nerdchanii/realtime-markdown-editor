import "reflect-metadata";

import { strict as assert } from "node:assert";
import type { AddressInfo } from "node:net";
import { test } from "node:test";

import { Controller, ForbiddenException, Get, Module, UnauthorizedException } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { ApiErrorResponseDto } from "@rme/contracts/http";

import { AppModule } from "@/app.module.js";
import { configureHttpBoundary } from "@/interfaces/http/http-boundary.js";

@Controller("boundary-errors")
class BoundaryErrorsController {
  @Get("unauthenticated")
  unauthenticated(): never {
    throw new UnauthorizedException("Authentication is required.");
  }

  @Get("forbidden")
  forbidden(): never {
    throw new ForbiddenException("Access is forbidden.");
  }
}

@Module({ controllers: [BoundaryErrorsController] })
class BoundaryErrorsModule {}

test("HTTP boundary applies centralized CORS", async () => {
  await withApp(AppModule, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/documents/checkpoints/checkpoint_missing/snapshot`, {
      headers: { Origin: "http://localhost:5173" },
    });

    assert.equal(response.headers.get("access-control-allow-origin"), "http://localhost:5173");
    assert.equal(response.headers.get("access-control-allow-credentials"), "true");
  });
});

test("HTTP boundary returns validation envelopes for invalid params, query, and body", async () => {
  await withApp(AppModule, async (baseUrl) => {
    await assertError(`${baseUrl}/documents/not%20valid/checkpoints`, {
      status: 400,
      code: "validation_failed",
    });
    await assertError(`${baseUrl}/documents/document_api/checkpoints`, {
      status: 400,
      code: "validation_failed",
      init: {
        method: "POST",
        body: JSON.stringify({ message: "" }),
        headers: { "Content-Type": "application/json" },
      },
    });
    await assertError(`${baseUrl}/auth/session`, {
      status: 400,
      code: "validation_failed",
      init: {
        method: "POST",
        body: JSON.stringify({ email: "alice@example.test" }),
        headers: { "Content-Type": "application/json" },
      },
    });
  });
});

test("HTTP boundary hides dev-only seed routes before validating them", async () => {
  await withEnv({ NODE_ENV: "production", RME_API_ENABLE_DEV_SEED_ROUTES: "true" }, async () => {
    await withApp(AppModule, async (baseUrl) => {
      await assertError(`${baseUrl}/collaboration/sessions/seed?memberId=!`, {
        status: 404,
        code: "not_found",
      });
      await assertError(`${baseUrl}/review-context/seed`, {
        status: 404,
        code: "not_found",
      });
    });
  });
});

test("HTTP boundary envelopes authz and missing resource errors", async () => {
  await withApp(BoundaryErrorsModule, async (baseUrl) => {
    await assertError(`${baseUrl}/boundary-errors/unauthenticated`, {
      status: 401,
      code: "unauthenticated",
      requestId: "request-test-401",
    });
    await assertError(`${baseUrl}/boundary-errors/forbidden`, {
      status: 403,
      code: "forbidden",
    });
  });

  await withApp(AppModule, async (baseUrl) => {
    await assertError(`${baseUrl}/documents/checkpoints/checkpoint_missing/snapshot`, {
      status: 404,
      code: "not_found",
    });
  });
});

async function withApp(
  moduleType: Parameters<typeof NestFactory.create>[0],
  callback: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const app = await NestFactory.create(moduleType, { logger: ["error"] });
  configureHttpBoundary(app);
  await app.listen(0);

  try {
    await callback(baseUrlForApp(app));
  } finally {
    await app.close();
  }
}

async function assertError(
  url: string,
  expected: Readonly<{
    status: number;
    code: ApiErrorResponseDto["code"];
    init?: RequestInit;
    requestId?: string;
  }>,
): Promise<void> {
  const response = await fetch(url, requestInit(expected));
  const body = (await response.json()) as ApiErrorResponseDto;

  assert.equal(response.status, expected.status);
  assert.equal(body.code, expected.code);
  assert.ok(body.message.length > 0);
  if (expected.code === "validation_failed") assert.ok(body.details?.length);
  if (expected.requestId) assert.equal(body.requestId, expected.requestId);
}

function requestInit(
  expected: Readonly<{ init?: RequestInit; requestId?: string }>,
): RequestInit | undefined {
  if (!expected.requestId) return expected.init;
  const headers = new Headers(expected.init?.headers);
  headers.set("X-Request-Id", expected.requestId);
  return { ...expected.init, headers };
}

function assertAddressInfo(address: string | AddressInfo | null): asserts address is AddressInfo {
  assert.notEqual(address, null);
  assert.notEqual(typeof address, "string");
}

function baseUrlForApp(app: Awaited<ReturnType<typeof NestFactory.create>>): string {
  const address = app.getHttpServer().address();
  assertAddressInfo(address);
  return `http://127.0.0.1:${address.port}`;
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
