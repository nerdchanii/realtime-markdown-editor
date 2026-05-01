import type { ApiClient } from "@/lib/api-client";

export type DocumentProperty = Readonly<{
  key?: string;
  label: string;
  value: string;
  rawValue?: string | boolean;
  valueType?: "text" | "status" | "date" | "member" | "checkbox";
  tone?: "neutral" | "success" | "warning";
}>;

export type DocumentBacklink = Readonly<{
  sourceDocumentId?: string;
  targetDocumentId?: string;
  title: string;
  source: string;
  excerpt: string;
}>;

export type DocumentContextViewModel = Readonly<{
  replacementPoint: string;
  label: string;
  documentId?: string;
  title?: string;
  persistedTitle?: string;
  apiClient?: ApiClient;
  path?: string;
  properties?: readonly DocumentProperty[];
  backlinks?: readonly DocumentBacklink[];
  onTitleUpdated?: () => void;
  onTitleDraftChange?: (title: string) => void;
  onPropertiesUpdated?: () => void;
}>;
