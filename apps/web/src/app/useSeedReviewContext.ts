import { useEffect, useState } from "react";

import type { SeedReviewContextDto } from "@rme/contracts";

import { createMockApiClient, fetchSeedReviewContext } from "@/lib/api-client";

type SeedReviewContextState =
  | Readonly<{ status: "loading"; context?: never; error?: never }>
  | Readonly<{ status: "ready"; context: SeedReviewContextDto; error?: never }>
  | Readonly<{ status: "error"; context?: never; error: Error }>;

export function useSeedReviewContext(): SeedReviewContextState {
  const [state, setState] = useState<SeedReviewContextState>({ status: "loading" });

  useEffect(() => {
    const abortController = new AbortController();
    void loadSeedReviewContext(abortController.signal, setState);

    return () => abortController.abort();
  }, []);

  return state;
}

async function loadSeedReviewContext(
  signal: AbortSignal,
  setState: (state: SeedReviewContextState) => void,
) {
  try {
    const context = await fetchSeedReviewContext(createMockApiClient());
    if (!signal.aborted) {
      setState({ status: "ready", context });
    }
  } catch (error) {
    if (!signal.aborted) {
      setState({ status: "error", error: toError(error) });
    }
  }
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error("Seed review context request failed");
}
