export function resolveActiveEditorDocumentId(viewModelDocumentId: string | undefined): string {
  return viewModelDocumentId ?? readDocumentIdFromLocation();
}

function readDocumentIdFromLocation() {
  if (typeof window === "undefined") {
    return "document_unavailable";
  }

  return new URLSearchParams(window.location.search).get("document") ?? "document_unavailable";
}
