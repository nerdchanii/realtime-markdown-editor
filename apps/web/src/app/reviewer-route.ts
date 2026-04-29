export type ReviewerRoute = Readonly<{
  member: string;
  document: string;
}>;

export function readReviewerRoute(): ReviewerRoute {
  if (typeof window === "undefined") {
    return fallbackRoute;
  }

  const params = new URLSearchParams(window.location.search);

  return {
    member: params.get("member") ?? fallbackRoute.member,
    document: params.get("document") ?? fallbackRoute.document,
  };
}

const fallbackRoute: ReviewerRoute = {
  member: "alice",
  document: "seed-review-plan",
};
