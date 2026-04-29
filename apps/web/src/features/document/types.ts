export type DocumentProperty = Readonly<{
  key?: string;
  label: string;
  value: string;
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
  title?: string;
  path?: string;
  properties?: readonly DocumentProperty[];
  backlinks?: readonly DocumentBacklink[];
}>;
