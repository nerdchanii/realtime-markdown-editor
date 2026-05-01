export function resolveActiveEditorDocumentId(viewModelDocumentId: string | undefined): string {
  return viewModelDocumentId ?? readDocumentIdFromLocation();
}

function readDocumentIdFromLocation() {
  if (typeof window === "undefined") {
    return "seed-review-plan";
  }

  return new URLSearchParams(window.location.search).get("document") ?? "seed-review-plan";
}
