import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type {
  DocumentId,
  DocumentPropertyDto,
  DocumentPropertyValueDto,
  WorkspaceMembershipId,
} from "@rme/contracts";

import { replaceDocumentProperties, updateDocument } from "@/lib/api-client";

import { PropertyField } from "./DocumentPropertyDisplay";
import { PropertiesSurface } from "./PropertiesSurface";
import type { DocumentContextViewModel, DocumentProperty } from "./types";

export const documentFeatureId = "document";

type DocumentPropertyValueType = NonNullable<DocumentProperty["valueType"]>;

export type { DocumentBacklink, DocumentContextViewModel, DocumentProperty } from "./types";

export type DocumentContextSlotProps = Readonly<{
  viewModel: DocumentContextViewModel;
}>;

export function DocumentContextSlot({ viewModel }: DocumentContextSlotProps) {
  const title = viewModel.title ?? "Untitled";
  const properties = viewModel.properties ?? [];
  const canEditProperties = Boolean(viewModel.apiClient && viewModel.documentId);

  return (
    <header
      className="document-context"
      aria-label="Document context"
      data-testid="document-header"
    >
      <EditableDocumentTitle key={title} title={title} viewModel={viewModel} />

      {canEditProperties ? (
        <EditableDocumentProperties
          key={properties
            .map((property) => `${property.key ?? property.label}:${property.value}`)
            .join("|")}
          properties={properties}
          viewModel={viewModel}
        />
      ) : properties.length ? (
        <div className="document-context__properties">
          {properties.map((property) => (
            <PropertyField key={property.key ?? property.label} property={property} />
          ))}
        </div>
      ) : null}
    </header>
  );
}

function EditableDocumentProperties({
  properties,
  viewModel,
}: Readonly<{
  properties: readonly DocumentProperty[];
  viewModel: DocumentContextViewModel;
}>) {
  const [draftProperties, setDraftProperties] = useState(properties);
  const [pendingProperties, setPendingProperties] = useState<readonly DocumentProperty[] | null>(
    null,
  );
  const [status, setStatus] = useState<"idle" | "saving" | "failed">("idle");

  useEffect(() => {
    if (!pendingProperties) return undefined;

    const timer = window.setTimeout(() => {
      void persistProperties({
        properties: pendingProperties,
        viewModel,
        setStatus,
      });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [pendingProperties, viewModel]);

  return (
    <div className="document-context__editable-properties">
      <PropertiesSurface
        properties={draftProperties}
        onPropertyAdd={() => {
          const nextProperties = addProperty(draftProperties);
          setDraftProperties(nextProperties);
          setPendingProperties(nextProperties);
        }}
        onPropertyKeyChange={(index, key) => {
          const nextProperties = draftProperties.map((property, propertyIndex) =>
            propertyIndex === index ? { ...property, key, label: key } : property,
          );
          setDraftProperties(nextProperties);
          if (key.trim()) setPendingProperties(nextProperties);
        }}
        onPropertyTypeChange={(index, valueType) => {
          const nextProperties = draftProperties.map((property, propertyIndex) =>
            propertyIndex === index ? convertPropertyType(property, valueType) : property,
          );
          setDraftProperties(nextProperties);
          setPendingProperties(nextProperties);
        }}
        onPropertyValueChange={(index, value) => {
          const nextProperties = draftProperties.map((property, propertyIndex) =>
            propertyIndex === index ? { ...property, value, rawValue: value } : property,
          );
          setDraftProperties(nextProperties);
          setPendingProperties(nextProperties);
        }}
        onPropertyDelete={(index) => {
          const nextProperties = draftProperties.filter(
            (_, propertyIndex) => propertyIndex !== index,
          );
          setDraftProperties(nextProperties);
          setPendingProperties(nextProperties);
        }}
      />
      {status === "failed" ? (
        <span role="alert" style={{ color: "var(--color-danger)", fontSize: "12px" }}>
          Property update failed.
        </span>
      ) : null}
    </div>
  );
}

function EditableDocumentTitle({
  title,
  viewModel,
}: Readonly<{
  title: string;
  viewModel: DocumentContextViewModel;
}>) {
  const [draftTitle, setDraftTitle] = useState(title);
  const [status, setStatus] = useState<"idle" | "saving" | "failed">("idle");
  const canEdit = Boolean(viewModel.apiClient && viewModel.documentId);
  const trimmedDraftTitle = draftTitle.trim();
  const persistedTitle = viewModel.persistedTitle ?? title;
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!canEdit) return undefined;
    if (!trimmedDraftTitle || trimmedDraftTitle === persistedTitle) return undefined;

    const timer = window.setTimeout(() => {
      void persistTitleChange({
        nextTitle: trimmedDraftTitle,
        viewModel,
        setStatus,
      });
    }, 500);

    return () => window.clearTimeout(timer);
  }, [canEdit, persistedTitle, trimmedDraftTitle, viewModel]);

  useEffect(() => {
    if (!canEdit || !viewModel.documentId) return;
    if (
      globalThis.sessionStorage?.getItem("rme.focus-title-document-id") !== viewModel.documentId
    ) {
      return;
    }

    globalThis.sessionStorage.removeItem("rme.focus-title-document-id");
    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, [canEdit, viewModel.documentId]);

  if (!canEdit) {
    return (
      <h1 className="slot-title" data-testid="document-title" style={{ marginBottom: "32px" }}>
        {title}
      </h1>
    );
  }

  return (
    <div style={{ display: "grid", gap: "4px", marginBottom: "32px" }}>
      <input
        aria-label="Document title"
        className="document-title-input"
        data-testid="document-title"
        ref={titleInputRef}
        onChange={(event) => {
          const nextTitle = event.target.value;
          setDraftTitle(nextTitle);
          viewModel.onTitleDraftChange?.(nextTitle);
        }}
        onKeyDown={(event) =>
          handleTitleKeyDown(event, {
            originalTitle: persistedTitle,
            nextTitle: trimmedDraftTitle,
            setDraftTitle,
            setStatus,
            viewModel,
          })
        }
        onBlur={() => {
          if (!trimmedDraftTitle) {
            setDraftTitle(persistedTitle);
            viewModel.onTitleDraftChange?.(persistedTitle);
            setStatus("idle");
            return;
          }
          if (trimmedDraftTitle === persistedTitle) return;
          void persistTitleChange({
            nextTitle: trimmedDraftTitle,
            viewModel,
            setStatus,
          });
        }}
        value={draftTitle}
      />
      {status === "failed" ? (
        <span role="alert" style={{ color: "var(--color-danger)", fontSize: "12px" }}>
          Title update failed.
        </span>
      ) : null}
    </div>
  );
}

function handleTitleKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  input: Readonly<{
    originalTitle: string;
    nextTitle: string;
    setDraftTitle: (title: string) => void;
    setStatus: (status: "idle" | "saving" | "failed") => void;
    viewModel: DocumentContextViewModel;
  }>,
) {
  if (event.key === "Enter") {
    if (!input.nextTitle) {
      input.setDraftTitle(input.originalTitle);
      input.viewModel.onTitleDraftChange?.(input.originalTitle);
      input.setStatus("idle");
      event.currentTarget.blur();
      return;
    }
    if (input.nextTitle && input.nextTitle !== input.originalTitle) {
      void persistTitleChange({
        nextTitle: input.nextTitle,
        viewModel: input.viewModel,
        setStatus: input.setStatus,
      });
    }
    event.currentTarget.blur();
    return;
  }

  if (event.key === "Escape") {
    input.setDraftTitle(input.originalTitle);
    input.viewModel.onTitleDraftChange?.(input.originalTitle);
    input.setStatus("idle");
    event.currentTarget.blur();
  }
}

async function commitTitleChange(
  input: Readonly<{
    nextTitle: string;
    viewModel: DocumentContextViewModel;
    setStatus: (status: "idle" | "saving" | "failed") => void;
  }>,
) {
  if (!input.viewModel.apiClient || !input.viewModel.documentId) return;

  input.setStatus("saving");
  try {
    await updateDocument(input.viewModel.apiClient, input.viewModel.documentId as DocumentId, {
      title: input.nextTitle,
    });
    input.viewModel.onTitleUpdated?.();
    input.setStatus("idle");
  } catch {
    input.setStatus("failed");
  }
}

const persistTitleChange = commitTitleChange;

async function persistProperties(
  input: Readonly<{
    properties: readonly DocumentProperty[];
    viewModel: DocumentContextViewModel;
    setStatus: (status: "idle" | "saving" | "failed") => void;
  }>,
) {
  if (!input.viewModel.apiClient || !input.viewModel.documentId) return;

  input.setStatus("saving");
  try {
    await replaceDocumentProperties(
      input.viewModel.apiClient,
      input.viewModel.documentId as DocumentId,
      {
        properties: input.properties
          .filter((property) => propertyKey(property).trim())
          .map(toDocumentPropertyDto),
      },
    );
    input.setStatus("idle");
  } catch {
    input.setStatus("failed");
  }
}

function addProperty(properties: readonly DocumentProperty[]) {
  const key = uniquePropertyKey(properties, "Property");
  return [
    ...properties,
    {
      key,
      label: key,
      value: "",
      rawValue: "",
      valueType: "text" as const,
      tone: "neutral" as const,
    },
  ];
}

function uniquePropertyKey(properties: readonly DocumentProperty[], label: string) {
  const baseKey = label.trim();
  if (!baseKey) return "Property";
  const existingKeys = new Set(properties.map(propertyKey));
  if (!existingKeys.has(baseKey)) return baseKey;

  let suffix = 2;
  while (existingKeys.has(`${baseKey} ${suffix}`)) {
    suffix += 1;
  }
  return `${baseKey} ${suffix}`;
}

function convertPropertyType(
  property: DocumentProperty,
  valueType: DocumentPropertyValueType,
): DocumentProperty {
  const value = valueForType(property, valueType);
  return {
    ...property,
    value,
    rawValue: rawValueForType(value, valueType),
    valueType,
    tone: valueType === "status" ? "warning" : "neutral",
  };
}

function valueForType(property: DocumentProperty, valueType: DocumentPropertyValueType) {
  if (valueType === "checkbox") {
    return property.value === "true" ? "true" : "false";
  }

  if (valueType === "date") {
    return isDateTimeInputValue(property.value) ? property.value : "";
  }

  return property.value === "false" && property.valueType === "checkbox" ? "" : property.value;
}

function rawValueForType(value: string, valueType: DocumentPropertyValueType) {
  if (valueType === "checkbox") return value === "true";
  return value;
}

function isDateTimeInputValue(value: string) {
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(value);
}

function propertyKey(property: DocumentProperty) {
  return property.key ?? property.label;
}

function toDocumentPropertyDto(property: DocumentProperty): DocumentPropertyDto {
  return {
    key: propertyKey(property).trim(),
    value: toDocumentPropertyValueDto(property),
  };
}

function toDocumentPropertyValueDto(property: DocumentProperty): DocumentPropertyValueDto {
  const type = property.valueType ?? "text";
  const rawValue = property.rawValue ?? property.value;

  if (type === "checkbox") {
    return { type, value: rawValue === true || property.value === "true" };
  }

  if (type === "date") return { type, value: String(rawValue) };
  if (type === "member") return { type, value: String(rawValue) as WorkspaceMembershipId };
  if (type === "status") return { type, value: String(rawValue) };
  return { type: "text", value: property.value };
}
