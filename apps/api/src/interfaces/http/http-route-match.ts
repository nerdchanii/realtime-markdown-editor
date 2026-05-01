import { httpRouteInventory, type HttpRouteContract } from "@rme/contracts/http";

type LiteralSegment = Readonly<{ kind: "literal"; value: string }>;
type ParamSegment = Readonly<{ kind: "param"; name: string }>;
type RouteSegment = LiteralSegment | ParamSegment;

type CompiledRoute = Readonly<{
  route: HttpRouteContract;
  segments: readonly RouteSegment[];
}>;

export type MatchedHttpRoute = Readonly<{
  route: HttpRouteContract;
  params: Readonly<Record<string, string>>;
}>;

const compiledRoutes = httpRouteInventory.map((route) => ({
  route,
  segments: compilePath(route.path),
})) satisfies readonly CompiledRoute[];

export function matchHttpRoute(method: string, pathname: string): MatchedHttpRoute | null {
  const requestSegments = splitPath(pathname);
  const route = compiledRoutes.find((candidate) =>
    routeMatches(candidate, method.toUpperCase(), requestSegments),
  );

  if (!route) return null;
  return { route: route.route, params: collectParams(route.segments, requestSegments) };
}

function compilePath(path: string): readonly RouteSegment[] {
  return splitPath(path).map((segment) => {
    if (segment.startsWith(":")) return { kind: "param", name: segment.slice(1) };
    return { kind: "literal", value: segment };
  });
}

function routeMatches(
  route: CompiledRoute,
  method: string,
  requestSegments: readonly string[],
): boolean {
  if (route.route.method !== method) return false;
  if (route.segments.length !== requestSegments.length) return false;
  return route.segments.every((segment, index) => segmentMatches(segment, requestSegments[index]));
}

function segmentMatches(segment: RouteSegment, requestSegment: string | undefined): boolean {
  if (requestSegment === undefined) return false;
  if (segment.kind === "param") return true;
  return segment.value === requestSegment;
}

function collectParams(
  routeSegments: readonly RouteSegment[],
  requestSegments: readonly string[],
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    routeSegments.flatMap((segment, index) =>
      segment.kind === "param" ? [[segment.name, decodeSegment(requestSegments[index] ?? "")]] : [],
    ),
  );
}

function splitPath(path: string): readonly string[] {
  return path.split("/").filter(Boolean).map(decodeSegment);
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}
