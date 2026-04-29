import type { SeedReviewContextDto } from "@rme/contracts";

export type ApiClient = Readonly<{
  baseUrl: string;
  providerName: string;
}>;

export const apiClientBoundaryId = "lib.api-client";
export const apiClientMockReplacementPoint = "lib.api-client.mock";

export function createMockApiClient(): ApiClient {
  return {
    baseUrl: "http://127.0.0.1:4000",
    providerName: apiClientMockReplacementPoint,
  };
}

export async function fetchSeedReviewContext(client: ApiClient): Promise<SeedReviewContextDto> {
  const response = await fetch(`${client.baseUrl}/review-context/seed`);

  if (!response.ok) {
    throw new Error(`Seed review context request failed with ${response.status}`);
  }

  return (await response.json()) as SeedReviewContextDto;
}
