export type ApiClient = Readonly<{
  baseUrl: string;
  providerName: string;
}>;

export const apiClientBoundaryId = "lib.api-client";
export const apiClientMockReplacementPoint = "lib.api-client.mock";

export function createMockApiClient(): ApiClient {
  return {
    baseUrl: "/api",
    providerName: apiClientMockReplacementPoint,
  };
}
