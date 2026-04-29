import type { WorkspaceMembershipId } from "@/modules/documents/domain/references.js";

export type DocumentPropertyValue =
  | { type: "text"; value: string }
  | { type: "status"; value: string }
  | { type: "date"; value: string }
  | { type: "member"; value: WorkspaceMembershipId }
  | { type: "checkbox"; value: boolean };

export type DocumentProperty = Readonly<{
  key: string;
  value: DocumentPropertyValue;
}>;
